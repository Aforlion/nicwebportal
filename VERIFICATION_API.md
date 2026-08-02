# Real-Time NIC Verification API Integration Guide

This document outlines how to integrate with the real-time Nursing Assistant Certificate (NIC) Verification REST API endpoint. 

The endpoint is public and allows external client dashboards, scheduling systems, and mobile applications to verify a caregiver's certificate status and qualifications.

---

## 1. Endpoint Contract
* **HTTP Method**: `GET`
* **URL**: `https://<your-domain>/api/v1/verify/<nicId>`
* **Route Parameter**:
  * `<nicId>` (string): The caregiver's NIC Member ID (e.g., `NIC/MEM/2026/0ZLXV` or `NIC-12345`). The lookup automatically resolves slashes and hyphens.

---

## 2. API Responses

### A. Success Response (`200 OK`)
Returned when the caregiver is found in the NIC database.

```json
{
  "success": true,
  "data": {
    "nic_id": "NIC/MEM/2026/0ZLXV",
    "full_name": "Kolawole Olusola Christwealth",
    "avatar_url": null,
    "status": "active",
    "is_active": true,
    "category": "institutional",
    "joined_date": "2026-07-31",
    "expiry_date": "2027-07-31",
    "certifications": [
      {
        "title": "Core Caregiver Fundamentals",
        "level": "Foundation",
        "completed_at": "2026-08-01T12:00:00.000Z"
      }
    ],
    "internship": {
      "status": "approved",
      "agency_name": "ILEWA CARE LIMITED"
    }
  }
}
```

#### Fields Description:
* `nic_id` (string): The unique certificate number of the caregiver.
* `full_name` (string): The caregiver's registered name.
* `avatar_url` (string|null): URL to the caregiver's profile image if available.
* `status` (string): Current membership status (`active`, `pending`, `suspended`, `expired`).
* `is_active` (boolean): Flag indicating if the certificate status is currently active.
* `category` (string): Membership type category.
* `certifications` (array): List of completed courses, their level, and completion dates.
* `internship` (object|null): Approved clinical internship placement records.

---

### B. Member Not Found (`404 Not Found`)
Returned if the provided ID is invalid or not registered in the system.

```json
{
  "success": false,
  "error": "Member not found"
}
```

### C. Missing Parameters (`400 Bad Request`)
Returned if the `nicId` route parameter is empty.

```json
{
  "success": false,
  "error": "Missing NIC Member ID"
}
```

---

## 3. Integration Examples

### JavaScript / Node.js
```javascript
async function verifyCaregiver(nicId) {
  try {
    const response = await fetch(`https://your-domain.com/api/v1/verify/${encodeURIComponent(nicId)}`);
    const result = await response.json();
    
    if (result.success) {
      console.log(`Caregiver ${result.data.full_name} is VERIFIED (Status: ${result.data.status})`);
      console.log("Certifications:", result.data.certifications);
    } else {
      console.error("Verification failed:", result.error);
    }
  } catch (error) {
    console.error("Network or API Error:", error.message);
  }
}
```

### Python
```python
import requests

def verify_caregiver(nic_id):
    url = f"https://your-domain.com/api/v1/verify/{nic_id}"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            if data["success"]:
                print(f"Verified: {data['data']['full_name']} (Status: {data['data']['status']})")
                return data["data"]
        print(f"Failed verification: {response.json().get('error')}")
    except Exception as e:
        print(f"Request error: {e}")
```

### cURL
```bash
curl -X GET https://your-domain.com/api/v1/verify/NIC/MEM/2026/0ZLXV
```
