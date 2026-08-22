import os
import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import PyPDF2
import docx
import resend
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import PyMongoError, ServerSelectionTimeoutError, ConnectionFailure
from bson import ObjectId
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Load environment variables from .env if present
load_dotenv()

app = Flask(__name__)

# Configure CORS - allows Vercel frontend, custom origins, or wildcard (*)
allowed_origins = os.getenv("CORS_ORIGIN", "*")
CORS(app, resources={r"/*": {
    "origins": allowed_origins if allowed_origins == "*" else [o.strip() for o in allowed_origins.split(",") if o.strip()],
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"]
}})

# Initialize Resend API key
resend.api_key = os.getenv("RESEND_API_KEY", "")

# Temporary upload folder (Render filesystem is ephemeral; extracted text is persisted in MongoDB Atlas)
UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "/tmp/uploads" if os.path.exists("/tmp") else "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

SKILLS = [
    'python',
    'django',
    'flask',
    'sql',
    'mysql',
    'mongodb',
    'react',
    'javascript',
    'html',
    'css',
    'machine learning',
    'firebase',
    'docker',
    'linux',
    'api',
    'git',
    'cloud',
    'tensorflow',
    'cybersecurity',
    'ethical hacking',
    'network security',
    'cloud security',
    'wireshark',
    'nmap',
    'burp suite'
]

# MongoDB Connection Helper
_mongo_client = None

def get_db():
    global _mongo_client
    if _mongo_client is None:
        mongo_uri = (
            os.getenv("MONGO_URI") or 
            os.getenv("MONGODB_URI") or 
            os.getenv("MONGO_URL") or 
            "mongodb://localhost:27017"
        )
        _mongo_client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
    
    db_name = os.getenv("DB_NAME", "ai_resume_screening")
    return _mongo_client[db_name]

def build_id_query(resume_id):
    """Builds MongoDB query filter supporting both ObjectId and legacy/string IDs."""
    if ObjectId.is_valid(str(resume_id)):
        return {"$or": [{"_id": ObjectId(str(resume_id))}, {"_id": str(resume_id)}, {"id": resume_id}]}
    try:
        numeric_id = int(resume_id)
        return {"$or": [{"_id": str(resume_id)}, {"id": numeric_id}, {"id": str(resume_id)}]}
    except (ValueError, TypeError):
        return {"$or": [{"_id": str(resume_id)}, {"id": str(resume_id)}]}

def extract_text_from_pdf(filepath):
    text = ''
    with open(filepath, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + '\n'
    return text

def extract_text_from_docx(filepath):
    doc = docx.Document(filepath)
    text = ''
    for para in doc.paragraphs:
        text += para.text + '\n'
    return text

def extract_skills(text):
    text = text.lower()
    found_skills = []
    for skill in SKILLS:
        if skill.lower() in text:
            found_skills.append(skill)
    return list(set(found_skills))

@app.route('/')
def home():
    return 'AI ATS Backend Running'

@app.route('/upload-job-description', methods=['POST'])
def upload_job_description():
    filepath = None
    try:
        db = get_db()
        if 'jd_file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400

        file = request.files['jd_file']
        if file.filename == '':
            return jsonify({'error': 'Empty filename'}), 400

        filepath = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(filepath)

        extracted_text = ''
        if file.filename.lower().endswith('.pdf'):
            extracted_text = extract_text_from_pdf(filepath)
        elif file.filename.lower().endswith('.docx'):
            extracted_text = extract_text_from_docx(filepath)
        else:
            return jsonify({'error': 'Unsupported file format'}), 400

        jd_doc = {
            'role_name': file.filename,
            'job_description': extracted_text,
            'created_at': datetime.datetime.now(datetime.timezone.utc)
        }
        db.job_descriptions.insert_one(jd_doc)

        return jsonify({'message': 'Job Description uploaded successfully'})

    except (ServerSelectionTimeoutError, ConnectionFailure) as e:
        return jsonify({'error': 'Database connection failed. Please check MongoDB Atlas connection.'}), 503
    except PyMongoError as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if filepath and os.path.exists(filepath):
            try:
                os.remove(filepath)
            except OSError:
                pass

@app.route('/upload-resume', methods=['POST'])
def upload_resume():
    filepath = None
    try:
        db = get_db()
        if 'resume' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400

        file = request.files['resume']
        if file.filename == '':
            return jsonify({'error': 'Empty filename'}), 400

        filepath = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(filepath)

        email = request.form.get('email', 'candidate@gmail.com')

        extracted_text = ''
        if file.filename.lower().endswith('.pdf'):
            extracted_text = extract_text_from_pdf(filepath)
        elif file.filename.lower().endswith('.docx'):
            extracted_text = extract_text_from_docx(filepath)
        else:
            return jsonify({'error': 'Unsupported file format'}), 400

        jd = db.job_descriptions.find_one(sort=[('_id', -1)])

        if not jd or not jd.get('job_description'):
            return jsonify({'error': 'No Job Description uploaded'}), 400

        job_description = jd['job_description']

        documents = [job_description, extracted_text]
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform(documents)

        similarity_score = cosine_similarity(
            tfidf_matrix[0:1],
            tfidf_matrix[1:2]
        )

        match_percentage = float(round(similarity_score[0][0] * 100, 2))

        jd_skills = extract_skills(job_description)
        resume_skills = extract_skills(extracted_text)

        matched_skills = list(set(jd_skills).intersection(set(resume_skills)))

        status = 'Shortlisted' if match_percentage >= 70 else 'Review'

        resume_doc = {
            'filename': file.filename,
            'match_percentage': match_percentage,
            'resume_text': extracted_text,
            'status': status,
            'skills': ', '.join(matched_skills),
            'shortlisted': bool(match_percentage >= 70),
            'email': email,
            'created_at': datetime.datetime.now(datetime.timezone.utc)
        }

        db.resumes.insert_one(resume_doc)

        return jsonify({
            'message': 'Resume uploaded successfully',
            'filename': file.filename,
            'match_percentage': match_percentage,
            'matched_skills': matched_skills,
            'status': status,
            'resume_text': extracted_text
        })

    except (ServerSelectionTimeoutError, ConnectionFailure) as e:
        return jsonify({'error': 'Database connection failed. Please check MongoDB Atlas connection.'}), 503
    except PyMongoError as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if filepath and os.path.exists(filepath):
            try:
                os.remove(filepath)
            except OSError:
                pass

@app.route('/hr-login', methods=['POST'])
def hr_login():
    try:
        db = get_db()
        data = request.json or {}
        email = data.get('email', '').strip()
        password = data.get('password', '').strip()

        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400

        # 1. Check against MongoDB hr_users collection
        hr = db.hr_users.find_one({'email': email, 'password': password})
        if hr:
            return jsonify({'message': 'Login successful'})

        # 2. Check against environment-configured demo/development credentials if provided
        default_hr_email = (os.getenv("DEFAULT_HR_EMAIL") or "").strip()
        default_hr_password = (os.getenv("DEFAULT_HR_PASSWORD") or "").strip()

        if default_hr_email and default_hr_password:
            if email == default_hr_email and password == default_hr_password:
                # Seed demo credentials into MongoDB hr_users collection if not present
                if not db.hr_users.find_one({'email': default_hr_email}):
                    db.hr_users.insert_one({
                        'email': default_hr_email,
                        'password': default_hr_password,
                        'created_at': datetime.datetime.now(datetime.timezone.utc)
                    })
                return jsonify({'message': 'Login successful'})

        return jsonify({'error': 'Invalid credentials'}), 401

    except (ServerSelectionTimeoutError, ConnectionFailure) as e:
        return jsonify({'error': 'Database connection failed. Please check MongoDB Atlas connection.'}), 503
    except PyMongoError as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get-resumes', methods=['GET'])
def get_resumes():
    try:
        db = get_db()
        search = request.args.get('search', '').strip()

        query_filter = {}
        if search:
            query_filter['filename'] = {'$regex': search, '$options': 'i'}

        resumes_cursor = db.resumes.find(query_filter).sort('match_percentage', -1)

        cleaned = []
        for resume in resumes_cursor:
            cleaned.append({
                'id': str(resume.get('_id')),
                'filename': resume.get('filename', ''),
                'match_percentage': float(resume.get('match_percentage', 0.0)),
                'resume_text': resume.get('resume_text', ''),
                'status': resume.get('status', 'Review'),
                'skills': resume.get('skills', '') or '',
                'shortlisted': bool(resume.get('shortlisted', False)),
                'email': resume.get('email', '')
            })

        return jsonify(cleaned)

    except (ServerSelectionTimeoutError, ConnectionFailure) as e:
        return jsonify({'error': 'Database connection failed. Please check MongoDB Atlas connection.'}), 503
    except PyMongoError as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/analytics', methods=['GET'])
def analytics():
    try:
        db = get_db()
        total = db.resumes.count_documents({})
        shortlisted = db.resumes.count_documents({'status': 'Shortlisted'})

        avg_score = 0.0
        pipeline = [{
            '$group': {
                '_id': None,
                'avg_score': {'$avg': '$match_percentage'}
            }
        }]
        avg_result = list(db.resumes.aggregate(pipeline))
        if avg_result and avg_result[0].get('avg_score') is not None:
            avg_score = float(round(avg_result[0]['avg_score'], 2))

        return jsonify({
            'total_resumes': int(total),
            'shortlisted': int(shortlisted),
            'average_score': avg_score
        })

    except (ServerSelectionTimeoutError, ConnectionFailure) as e:
        return jsonify({'error': 'Database connection failed. Please check MongoDB Atlas connection.'}), 503
    except PyMongoError as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/update-status/<resume_id>', methods=['PUT'])
def update_status(resume_id):
    try:
        db = get_db()
        data = request.json or {}
        status = data.get('status')

        if not status:
            return jsonify({'error': 'Status is required'}), 400

        query = build_id_query(resume_id)
        result = db.resumes.update_one(query, {'$set': {'status': status}})

        if result.matched_count == 0:
            return jsonify({'error': 'Resume not found'}), 404

        return jsonify({'message': 'Status updated successfully'})

    except (ServerSelectionTimeoutError, ConnectionFailure) as e:
        return jsonify({'error': 'Database connection failed. Please check MongoDB Atlas connection.'}), 503
    except PyMongoError as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/delete-resume/<resume_id>', methods=['DELETE'])
def delete_resume(resume_id):
    try:
        db = get_db()
        query = build_id_query(resume_id)
        result = db.resumes.delete_one(query)

        if result.deleted_count == 0:
            return jsonify({'error': 'Resume not found'}), 404

        return jsonify({'message': 'Resume deleted successfully'})

    except (ServerSelectionTimeoutError, ConnectionFailure) as e:
        return jsonify({'error': 'Database connection failed. Please check MongoDB Atlas connection.'}), 503
    except PyMongoError as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/send-email', methods=['POST'])
def send_email():
    try:
        db = get_db()
        data = request.json or {}
        candidate_email = data.get('email')
        subject = data.get('subject', 'Application Update')
        body = data.get('message', '')

        if not candidate_email:
            return jsonify({'error': 'Candidate email is required'}), 400

        api_key = os.getenv("RESEND_API_KEY", "").strip()
        if api_key:
            resend.api_key = api_key
            resend.Emails.send({
                "from": "onboarding@resend.dev",
                "to": [candidate_email],
                "subject": subject,
                "html": f"<p>{body}</p>"
            })

        db.email_logs.insert_one({
            'candidate_email': candidate_email,
            'subject': subject,
            'message': body,
            'created_at': datetime.datetime.now(datetime.timezone.utc)
        })

        return jsonify({'message': 'Email sent successfully'})

    except (ServerSelectionTimeoutError, ConnectionFailure) as e:
        return jsonify({'error': 'Database connection failed. Please check MongoDB Atlas connection.'}), 503
    except PyMongoError as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5001))
    app.run(
        host='0.0.0.0',
        port=port
    )