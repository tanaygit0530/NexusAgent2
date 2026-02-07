#!/usr/bin/env python3
"""
Demo script to assign tickets to admin "Tanay" and mark some as resolved
for testing the Admin Workspace feature
"""

import requests
import random
from datetime import datetime, timedelta

API_BASE = "http://127.0.0.1:8000"

def assign_ticket(ticket_id, admin_name="Tanay"):
    """Assign a ticket to an admin"""
    response = requests.patch(
        f"{API_BASE}/tickets/{ticket_id}/assign",
        json={"admin_name": admin_name}
    )
    if response.status_code == 200:
        print(f"✅ Assigned {ticket_id} to {admin_name}")
    else:
        print(f"❌ Failed to assign {ticket_id}: {response.text}")
    return response.status_code == 200

def resolve_ticket(ticket_id):
    """Mark a ticket as resolved"""
    response = requests.patch(
        f"{API_BASE}/tickets/{ticket_id}/status",
        json={"status": "Resolved"}
    )
    if response.status_code == 200:
        print(f"✅ Resolved {ticket_id}")
    else:
        print(f"❌ Failed to resolve {ticket_id}: {response.text}")
    return response.status_code == 200

def main():
    print("🚀 Setting up Admin Workspace demo data...\n")
    
    # Get all tickets
    response = requests.get(f"{API_BASE}/tickets/")
    if response.status_code != 200:
        print("❌ Failed to fetch tickets")
        return
    
    tickets = response.json()
    
    if len(tickets) < 5:
        print("⚠️  Not enough tickets. Please create some tickets first.")
        return
    
    # Filter out spam tickets
    active_tickets = [t for t in tickets if t.get('is_spam') == 'false']
    
    if len(active_tickets) < 5:
        print("⚠️  Not enough active tickets.")
        return
    
    # Assign 5-8 tickets to Tanay
    num_to_assign = min(8, len(active_tickets))
    selected_tickets = random.sample(active_tickets, num_to_assign)
    
    print(f"📋 Assigning {num_to_assign} tickets to Tanay...\n")
    
    assigned = []
    for ticket in selected_tickets:
        if assign_ticket(ticket['ticket_id']):
            assigned.append(ticket)
    
    # Resolve about half of them
    num_to_resolve = len(assigned) // 2
    to_resolve = random.sample(assigned, num_to_resolve)
    
    print(f"\n✅ Resolving {num_to_resolve} tickets...\n")
    
    for ticket in to_resolve:
        resolve_ticket(ticket['ticket_id'])
    
    print(f"\n🎉 Demo setup complete!")
    print(f"   - {len(assigned)} tickets assigned to Tanay")
    print(f"   - {num_to_resolve} tickets resolved")
    print(f"   - {len(assigned) - num_to_resolve} tickets currently solving")
    print(f"\n💡 Navigate to 'My Workspace' tab in the admin dashboard to see the results!")

if __name__ == "__main__":
    main()
