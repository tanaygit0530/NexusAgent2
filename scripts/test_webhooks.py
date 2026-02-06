import requests
import json
import argparse

BASE_URL = "http://127.0.0.1:8000/webhooks"

def test_whatsapp(sender, message):
    payload = {
        "sender": sender,
        "message": message
    }
    response = requests.post(f"{BASE_URL}/whatsapp", json=payload)
    print(f"WhatsApp Webhook Response: {response.status_code}")
    print(json.dumps(response.json(), indent=2))

def test_email(sender, subject, body):
    payload = {
        "sender": sender,
        "subject": subject,
        "body": body
    }
    response = requests.post(f"{BASE_URL}/email", json=payload)
    print(f"Email Webhook Response: {response.status_code}")
    print(json.dumps(response.json(), indent=2))

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test NexusAgent Webhooks")
    parser.add_argument("--type", choices=["whatsapp", "email"], required=True)
    parser.add_argument("--sender", required=True)
    parser.add_argument("--message", help="For WhatsApp")
    parser.add_argument("--subject", help="For Email")
    parser.add_argument("--body", help="For Email")

    args = parser.parse_args()

    if args.type == "whatsapp":
        test_whatsapp(args.sender, args.message)
    elif args.type == "email":
        test_email(args.sender, args.subject, args.body)
