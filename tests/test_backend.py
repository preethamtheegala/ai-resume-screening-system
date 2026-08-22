import io
import os
import sys
import unittest
import mongomock
import docx
from unittest.mock import patch
from pymongo.errors import ServerSelectionTimeoutError

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Configure test environment
os.environ["MONGO_URI"] = "mongodb://localhost:27017"
os.environ["DB_NAME"] = "test_ai_resume_screening"
os.environ["DEFAULT_HR_EMAIL"] = "hr@company.com"
os.environ["DEFAULT_HR_PASSWORD"] = "admin123"
os.environ["RESEND_API_KEY"] = ""

import app as flask_module
from app import app

class BackendTestCase(unittest.TestCase):
    def setUp(self):
        self.mock_client = mongomock.MongoClient()
        self.mock_db = self.mock_client["test_ai_resume_screening"]
        flask_module._mongo_client = self.mock_client
        self.client = app.test_client()

    def tearDown(self):
        self.mock_client.drop_database("test_ai_resume_screening")

    def _create_sample_docx(self, content):
        doc = docx.Document()
        doc.add_paragraph(content)
        bio = io.BytesIO()
        doc.save(bio)
        bio.seek(0)
        return bio

    def test_01_home_health_check(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'AI ATS Backend Running', response.data)
        self.assertEqual(response.headers.get('Access-Control-Allow-Origin'), '*')

    def test_02_hr_login(self):
        # 1. Test missing fields
        res_missing = self.client.post('/hr-login', json={'email': ''})
        self.assertEqual(res_missing.status_code, 400)
        self.assertIn('Email and password are required', res_missing.get_json().get('error'))

        # 2. Test invalid login
        res = self.client.post('/hr-login', json={'email': 'wrong@company.com', 'password': 'wrong'})
        self.assertEqual(res.status_code, 401)
        self.assertIn('Invalid credentials', res.get_json().get('error'))

        # 3. Test default demo login (read from env variables)
        res = self.client.post('/hr-login', json={'email': 'hr@company.com', 'password': 'admin123'})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json().get('message'), 'Login successful')

        # 4. Verify HR was seeded in hr_users collection
        user_in_db = self.mock_db.hr_users.find_one({'email': 'hr@company.com'})
        self.assertIsNotNone(user_in_db)

    def test_03_job_description_upload(self):
        jd_docx = self._create_sample_docx("We are seeking a Senior Python Developer with strong skills in Python, Flask, MongoDB, Docker, and React.")
        data = {
            'jd_file': (jd_docx, 'senior_python_jd.docx')
        }
        res = self.client.post('/upload-job-description', data=data, content_type='multipart/form-data')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json().get('message'), 'Job Description uploaded successfully')

        # Verify in DB
        jd_in_db = self.mock_db.job_descriptions.find_one(sort=[('_id', -1)])
        self.assertIsNotNone(jd_in_db)
        self.assertEqual(jd_in_db['role_name'], 'senior_python_jd.docx')
        self.assertIn('Python', jd_in_db['job_description'])

    def test_04_resume_upload_and_screening(self):
        # First ensure a JD exists
        jd_docx = self._create_sample_docx("Seeking Python, Flask, React, Docker expert for full stack role.")
        self.client.post('/upload-job-description', data={'jd_file': (jd_docx, 'job.docx')}, content_type='multipart/form-data')

        # Upload matching resume
        resume_docx = self._create_sample_docx("Experience in Python, Flask, React, Docker, Linux development.")
        data = {
            'resume': (resume_docx, 'john_doe_resume.docx'),
            'email': 'john@example.com'
        }
        res = self.client.post('/upload-resume', data=data, content_type='multipart/form-data')
        self.assertEqual(res.status_code, 200)
        body = res.get_json()
        self.assertEqual(body.get('filename'), 'john_doe_resume.docx')
        self.assertGreater(body.get('match_percentage'), 0)
        self.assertTrue(isinstance(body.get('matched_skills'), list))
        self.assertIn('python', [s.lower() for s in body.get('matched_skills')])
        self.assertIn(body.get('status'), ['Shortlisted', 'Review'])

    def test_05_get_resumes_and_search(self):
        # Insert test resumes into mock db
        self.mock_db.resumes.insert_many([
            {
                'filename': 'alice_python_dev.pdf',
                'match_percentage': 92.5,
                'resume_text': 'Alice Python React Docker developer',
                'status': 'Shortlisted',
                'skills': 'python, react, docker',
                'shortlisted': True,
                'email': 'alice@example.com'
            },
            {
                'filename': 'bob_java_dev.pdf',
                'match_percentage': 45.0,
                'resume_text': 'Bob Java Spring developer',
                'status': 'Review',
                'skills': 'sql',
                'shortlisted': False,
                'email': 'bob@example.com'
            }
        ])

        # Get all
        res = self.client.get('/get-resumes')
        self.assertEqual(res.status_code, 200)
        items = res.get_json()
        self.assertEqual(len(items), 2)
        self.assertEqual(items[0]['filename'], 'alice_python_dev.pdf')
        self.assertEqual(items[0]['match_percentage'], 92.5)
        self.assertTrue(isinstance(items[0]['id'], str))

        # Search
        res_search = self.client.get('/get-resumes?search=alice')
        self.assertEqual(res_search.status_code, 200)
        search_items = res_search.get_json()
        self.assertEqual(len(search_items), 1)
        self.assertEqual(search_items[0]['filename'], 'alice_python_dev.pdf')

    def test_06_analytics(self):
        self.mock_db.resumes.insert_many([
            {'match_percentage': 90.0, 'status': 'Shortlisted'},
            {'match_percentage': 80.0, 'status': 'Shortlisted'},
            {'match_percentage': 50.0, 'status': 'Review'}
        ])

        res = self.client.get('/analytics')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data.get('total_resumes'), 3)
        self.assertEqual(data.get('shortlisted'), 2)
        self.assertAlmostEqual(data.get('average_score'), 73.33, places=2)

    def test_07_update_status_and_delete(self):
        doc = {
            'filename': 'test_cand.pdf',
            'match_percentage': 88.0,
            'status': 'Review',
            'email': 'cand@example.com'
        }
        res_ins = self.mock_db.resumes.insert_one(doc)
        cand_id = str(res_ins.inserted_id)

        # Update status
        res_upd = self.client.put(f'/update-status/{cand_id}', json={'status': 'Shortlisted'})
        self.assertEqual(res_upd.status_code, 200)
        self.assertEqual(res_upd.get_json().get('message'), 'Status updated successfully')

        updated_doc = self.mock_db.resumes.find_one({'_id': res_ins.inserted_id})
        self.assertEqual(updated_doc['status'], 'Shortlisted')

        # Delete resume
        res_del = self.client.delete(f'/delete-resume/{cand_id}')
        self.assertEqual(res_del.status_code, 200)
        self.assertEqual(res_del.get_json().get('message'), 'Resume deleted successfully')

        deleted_doc = self.mock_db.resumes.find_one({'_id': res_ins.inserted_id})
        self.assertIsNone(deleted_doc)

        # Non-existent delete
        res_del_none = self.client.delete(f'/delete-resume/{cand_id}')
        self.assertEqual(res_del_none.status_code, 404)

    def test_08_send_email(self):
        payload = {
            'email': 'cand@example.com',
            'subject': 'Interview Invitation',
            'message': 'You have been shortlisted.'
        }
        res = self.client.post('/send-email', json=payload)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json().get('message'), 'Email sent successfully')

        log_entry = self.mock_db.email_logs.find_one({'candidate_email': 'cand@example.com'})
        self.assertIsNotNone(log_entry)
        self.assertEqual(log_entry['subject'], 'Interview Invitation')

    def test_09_database_connection_failure_handling(self):
        with patch('app.get_db', side_effect=ServerSelectionTimeoutError("Timed out")):
            res = self.client.get('/get-resumes')
            self.assertEqual(res.status_code, 503)
            self.assertIn('Database connection failed', res.get_json().get('error'))

if __name__ == '__main__':
    unittest.main()
