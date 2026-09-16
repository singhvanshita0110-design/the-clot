from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)
CORS(app)

# --- Database configuration ---
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///theclot.db'
db = SQLAlchemy(app)

# --- Models (tables) ---
class Client(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    contact = db.Column(db.String(100), nullable=False)
    notes = db.Column(db.Text, nullable=True)
    appointments = db.relationship('Appointment', backref='client', lazy=True)

class Appointment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('client.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    time_slot = db.Column(db.String(20), nullable=False)
    service = db.Column(db.String(100), nullable=True)
    status = db.Column(db.String(20), default="confirmed")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# --- Routes ---
@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok", "message": "THECLOT backend is alive"})

@app.route("/api/clients", methods=["POST"])
def create_client():
    data = request.get_json()
    new_client = Client(
        name=data.get("name"),
        contact=data.get("contact"),
        notes=data.get("notes")
    )
    db.session.add(new_client)
    db.session.commit()
    return jsonify({
        "id": new_client.id,
        "name": new_client.name,
        "contact": new_client.contact,
        "notes": new_client.notes
    }), 201
@app.route("/api/clients", methods=["GET"])
def get_clients():
    clients = Client.query.all()
    result = []
    for c in clients:
        result.append({
            "id": c.id,
            "name": c.name,
            "contact": c.contact,
            "notes": c.notes
        })
    return jsonify(result)
from datetime import datetime as dt

@app.route("/api/appointments", methods=["POST"])
def create_appointment():
    data = request.get_json()

    client_id = data.get("client_id")
    date_str = data.get("date")
    time_slot = data.get("time_slot")
    service = data.get("service")

    appointment_date = dt.strptime(date_str, "%Y-%m-%d").date()

    existing = Appointment.query.filter_by(
        date=appointment_date,
        time_slot=time_slot,
        status="confirmed"
    ).first()

    if existing:
        return jsonify({"error": "This time slot is already booked"}), 409

    new_appointment = Appointment(
        client_id=client_id,
        date=appointment_date,
        time_slot=time_slot,
        service=service
    )
    db.session.add(new_appointment)
    db.session.commit()

    return jsonify({
        "id": new_appointment.id,
        "client_id": new_appointment.client_id,
        "date": str(new_appointment.date),
        "time_slot": new_appointment.time_slot,
        "service": new_appointment.service,
        "status": new_appointment.status
    }), 201

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)