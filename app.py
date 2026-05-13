from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import PyPDF2
import docx
import mysql.connector
import resend

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)

CORS(app)

resend.api_key = os.getenv("RESEND_API_KEY")

UPLOAD_FOLDER = 'uploads'

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

SKILLS = [
    'python',
    'django',
    'flask',
    'sql',
    'mysql',
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

def get_connection():

    return mysql.connector.connect(
        host=os.getenv("MYSQLHOST"),
        user=os.getenv("MYSQLUSER"),
        password=os.getenv("MYSQLPASSWORD"),
        database=os.getenv("MYSQLDATABASE"),
        port=int(os.getenv("MYSQLPORT"))
    )

def extract_text_from_pdf(filepath):

    text = ''

    with open(filepath, 'rb') as file:

        reader = PyPDF2.PdfReader(file)

        for page in reader.pages:

            page_text = page.extract_text()

            if page_text:

                text += page_text

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

    db = get_connection()

    cursor = db.cursor(dictionary=True)

    try:

        if 'jd_file' not in request.files:

            return jsonify({
                'error': 'No file uploaded'
            }), 400

        file = request.files['jd_file']

        filepath = os.path.join(
            UPLOAD_FOLDER,
            file.filename
        )

        file.save(filepath)

        extracted_text = ''

        if file.filename.endswith('.pdf'):

            extracted_text = extract_text_from_pdf(filepath)

        elif file.filename.endswith('.docx'):

            extracted_text = extract_text_from_docx(filepath)

        else:

            return jsonify({
                'error': 'Unsupported file format'
            }), 400

        query = '''
        INSERT INTO job_descriptions
        (
            role_name,
            job_description
        )
        VALUES (%s, %s)
        '''

        cursor.execute(query, (
            file.filename,
            extracted_text
        ))

        db.commit()

        return jsonify({
            'message': 'Job Description uploaded successfully'
        })

    except Exception as e:

        return jsonify({
            'error': str(e)
        }), 500

    finally:

        cursor.close()
        db.close()

@app.route('/upload-resume', methods=['POST'])
def upload_resume():

    db = get_connection()

    cursor = db.cursor(dictionary=True)

    try:

        if 'resume' not in request.files:

            return jsonify({
                'error': 'No file uploaded'
            }), 400

        file = request.files['resume']

        filepath = os.path.join(
            UPLOAD_FOLDER,
            file.filename
        )

        file.save(filepath)

        email = request.form.get(
            'email',
            'candidate@gmail.com'
        )

        extracted_text = ''

        if file.filename.endswith('.pdf'):

            extracted_text = extract_text_from_pdf(filepath)

        elif file.filename.endswith('.docx'):

            extracted_text = extract_text_from_docx(filepath)

        else:

            return jsonify({
                'error': 'Unsupported file format'
            }), 400

        cursor.execute('''
        SELECT job_description
        FROM job_descriptions
        ORDER BY id DESC
        LIMIT 1
        ''')

        jd = cursor.fetchone()

        if not jd:

            return jsonify({
                'error': 'No Job Description uploaded'
            }), 400

        job_description = jd['job_description']

        documents = [
            job_description,
            extracted_text
        ]

        vectorizer = TfidfVectorizer()

        tfidf_matrix = vectorizer.fit_transform(documents)

        similarity_score = cosine_similarity(
            tfidf_matrix[0:1],
            tfidf_matrix[1:2]
        )

        match_percentage = float(
            round(similarity_score[0][0] * 100, 2)
        )

        jd_skills = extract_skills(job_description)

        resume_skills = extract_skills(extracted_text)

        matched_skills = list(
            set(jd_skills).intersection(
                set(resume_skills)
            )
        )

        status = (
            'Shortlisted'
            if match_percentage >= 70
            else 'Review'
        )

        query = '''
        INSERT INTO resumes
        (
            filename,
            match_percentage,
            resume_text,
            status,
            skills,
            shortlisted,
            email
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        '''

        cursor.execute(query, (
            file.filename,
            match_percentage,
            extracted_text,
            status,
            ', '.join(matched_skills),
            bool(match_percentage >= 70),
            email
        ))

        db.commit()

        return jsonify({
            'message': 'Resume uploaded successfully',
            'filename': file.filename,
            'match_percentage': match_percentage,
            'matched_skills': matched_skills,
            'status': status,
            'resume_text': extracted_text
        })

    except Exception as e:

        return jsonify({
            'error': str(e)
        }), 500

    finally:

        cursor.close()
        db.close()

@app.route('/hr-login', methods=['POST'])
def hr_login():

    db = get_connection()

    cursor = db.cursor(dictionary=True)

    try:

        data = request.json

        email = data.get('email')

        password = data.get('password')

        cursor.execute('''
        SELECT *
        FROM hr_users
        WHERE email=%s AND password=%s
        ''', (
            email,
            password
        ))

        hr = cursor.fetchone()

        if hr:

            return jsonify({
                'message': 'Login successful'
            })

        return jsonify({
            'error': 'Invalid credentials'
        }), 401

    except Exception as e:

        return jsonify({
            'error': str(e)
        }), 500

    finally:

        cursor.close()
        db.close()

@app.route('/get-resumes', methods=['GET'])
def get_resumes():

    db = get_connection()

    cursor = db.cursor(dictionary=True)

    try:

        search = request.args.get(
            'search',
            ''
        )

        cursor.execute('''
        SELECT *
        FROM resumes
        WHERE filename LIKE %s
        ORDER BY match_percentage DESC
        ''', (
            f'%{search}%',
        ))

        resumes = cursor.fetchall()

        cleaned = []

        for resume in resumes:

            cleaned.append({
                'id': int(resume['id']),
                'filename': resume['filename'],
                'match_percentage': float(
                    resume['match_percentage']
                ),
                'resume_text': resume['resume_text'],
                'status': resume['status'],
                'skills': resume['skills'] or '',
                'shortlisted': bool(
                    resume['shortlisted']
                ),
                'email': resume['email']
            })

        return jsonify(cleaned)

    except Exception as e:

        return jsonify({
            'error': str(e)
        }), 500

    finally:

        cursor.close()
        db.close()

@app.route('/analytics', methods=['GET'])
def analytics():

    db = get_connection()

    cursor = db.cursor(dictionary=True)

    try:

        cursor.execute(
            'SELECT COUNT(*) AS total FROM resumes'
        )

        total = int(
            cursor.fetchone()['total']
        )

        cursor.execute('''
        SELECT COUNT(*) AS shortlisted
        FROM resumes
        WHERE status='Shortlisted'
        ''')

        shortlisted = int(
            cursor.fetchone()['shortlisted']
        )

        cursor.execute('''
        SELECT AVG(match_percentage)
        AS avg_score
        FROM resumes
        ''')

        avg_result = cursor.fetchone()

        avg_score = 0

        if avg_result['avg_score']:

            avg_score = float(
                round(
                    avg_result['avg_score'],
                    2
                )
            )

        return jsonify({
            'total_resumes': total,
            'shortlisted': shortlisted,
            'average_score': avg_score
        })

    except Exception as e:

        return jsonify({
            'error': str(e)
        }), 500

    finally:

        cursor.close()
        db.close()

@app.route('/update-status/<int:resume_id>', methods=['PUT'])
def update_status(resume_id):

    db = get_connection()

    cursor = db.cursor(dictionary=True)

    try:

        data = request.json

        status = data.get('status')

        cursor.execute('''
        UPDATE resumes
        SET status=%s
        WHERE id=%s
        ''', (
            status,
            resume_id
        ))

        db.commit()

        return jsonify({
            'message': 'Status updated successfully'
        })

    except Exception as e:

        return jsonify({
            'error': str(e)
        }), 500

    finally:

        cursor.close()
        db.close()

@app.route('/delete-resume/<int:resume_id>', methods=['DELETE'])
def delete_resume(resume_id):

    db = get_connection()

    cursor = db.cursor(dictionary=True)

    try:

        cursor.execute('''
        DELETE FROM resumes
        WHERE id=%s
        ''', (
            resume_id,
        ))

        db.commit()

        return jsonify({
            'message': 'Resume deleted successfully'
        })

    except Exception as e:

        return jsonify({
            'error': str(e)
        }), 500

    finally:

        cursor.close()
        db.close()

@app.route('/send-email', methods=['POST'])
def send_email():

    db = get_connection()

    cursor = db.cursor(dictionary=True)

    try:

        data = request.json

        candidate_email = data.get('email')

        subject = data.get('subject')

        body = data.get('message')

        resend.Emails.send({
            "from": "onboarding@resend.dev",
            "to": [candidate_email],
            "subject": subject,
            "html": f"<p>{body}</p>"
        })

        cursor.execute('''
        INSERT INTO email_logs
        (
            candidate_email,
            subject,
            message
        )
        VALUES (%s, %s, %s)
        ''', (
            candidate_email,
            subject,
            body
        ))

        db.commit()

        return jsonify({
            'message': 'Email sent successfully'
        })

    except Exception as e:

        return jsonify({
            'error': str(e)
        }), 500

    finally:

        cursor.close()
        db.close()

if __name__ == '__main__':

    app.run(
        host='0.0.0.0',
        port=5001
    )