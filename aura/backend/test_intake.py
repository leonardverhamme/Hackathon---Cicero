import requests
import json

# Test data
test_payload = {
    "event": "conversation.completed",
    "data": {
        "id": "test123",
        "agent_id": "agent456",
        "transcript": [
            {"role": "user", "content": "I need help with AI compliance for a hiring tool"},
            {"role": "agent", "content": "What features does it have?"},
            {"role": "user", "content": "It uses ML to screen resumes and predict candidate fit"}
        ]
    }
}

# Test intake
response = requests.post("http://localhost:8000/intake", json=test_payload)
print("Intake Response:", response.json())

if response.status_code == 200:
    session_id = response.json()["session_id"]
    print(f"Session ID: {session_id}")

    # Test streaming summary
    print("\n--- Streaming Summary ---")
    response = requests.post(f"http://localhost:8000/stream_summary/{session_id}")
    print("Status:", response.status_code)
    print("Response:", response.text)

    print("\n\n--- Streaming Legal Assessment ---")
    with requests.post(f"http://localhost:8000/stream_legal_assessment/{session_id}", stream=True) as r:
        full_legal = ""
        for line in r.iter_lines():
            if line:
                chunk = line.decode('utf-8')
                print(chunk, end='')
                full_legal += chunk

    print("\n\n--- Streaming Risk Assessment ---")
    # Parse the legal assessment JSON
    try:
        legal_data = json.loads(full_legal)
        risk_payload = {"legal_assessment": json.dumps(legal_data)}
    except:
        risk_payload = {"legal_assessment": full_legal}

    with requests.post(f"http://localhost:8000/stream_risk_assessment/{session_id}", json=risk_payload, stream=True) as r:
        for line in r.iter_lines():
            if line:
                print(line.decode('utf-8'), end='')

    print("\n\nTest completed successfully!")
else:
    print("Intake failed")
