import requests
import json

# Test data for the intake webhook
test_payload = {
    "event": "conversation.completed",
    "data": {
        "id": "test123",
        "agent_id": "agent456",
        "transcript": [
            {"role": "user", "content": "I need help with AI compliance for a hiring tool."},
            {"role": "agent", "content": "What features does it have?"},
            {"role": "user", "content": "It uses ML to screen resumes and predict candidate fit."}
        ]
    }
}

# --- Test Execution ---
# 1. Test the /intake endpoint
print("--- Testing /intake ---")
response = requests.post("http://localhost:8001/intake", json=test_payload)
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")

if response.status_code == 200:
    session_id = response.json()["session_id"]
    print(f"Obtained Session ID: {session_id}\n")

    # 2. Test the streaming summary
    print("--- Streaming Summary ---")
    summary_response = requests.post(f"http://localhost:8001/stream_summary/{session_id}", stream=True)
    print(f"Status: {summary_response.status_code}")
    if summary_response.status_code == 200:
        for chunk in summary_response.iter_content(chunk_size=None):
            if chunk:
                print(chunk.decode('utf-8'), end='')
    print("\n--- Summary Complete ---\n")

    # 3. Test the streaming legal assessment
    print("--- Streaming Legal Assessment ---")
    legal_assessment_response = requests.post(f"http://localhost:8001/stream_legal_assessment/{session_id}", stream=True)
    print(f"Status: {legal_assessment_response.status_code}")
    full_legal_text = ""
    if legal_assessment_response.status_code == 200:
        for chunk in legal_assessment_response.iter_content(chunk_size=None):
            if chunk:
                decoded_chunk = chunk.decode('utf-8')
                print(decoded_chunk, end='')
                full_legal_text += decoded_chunk
    print("\n--- Legal Assessment Complete ---\n")

    # 4. Test the streaming risk assessment
    print("--- Streaming Risk Assessment ---")
    risk_payload = {"legal_assessment": full_legal_text}
    risk_assessment_response = requests.post(f"http://localhost:8001/stream_risk_assessment/{session_id}", json=risk_payload, stream=True)
    print(f"Status: {risk_assessment_response.status_code}")
    if risk_assessment_response.status_code == 200:
        for chunk in risk_assessment_response.iter_content(chunk_size=None):
            if chunk:
                print(chunk.decode('utf-8'), end='')
    print("\n--- Risk Assessment Complete ---\n")

    print("Test script finished successfully!")
else:
    print("Intake failed, stopping tests.")
