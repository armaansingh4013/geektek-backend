# API cURL Examples

## Inquiry Endpoints

### Create Inquiry
```bash
curl -X POST http://localhost:3000/api/inquiries \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "address": "123 Main St",
    "postcode": "12345",
    "approximateBudget": "50000",
    "planningPermission": true,
    "visitOrCall": "visit",
    "planToStart": "next month",
    "date": "2024-03-20",
    "time": "14:00",
    "message": "I need a quote for my project",
    "additionalDocument": {
      "imageUrl": "https://example.com/image.jpg",
      "public_id": "image_123"
    }
  }'
```

### Get All Inquiries
```bash
curl -X GET http://localhost:3000/api/inquiries
```

## Estimation Endpoints

### Create Estimation
```bash
curl -X POST http://localhost:3000/api/estimations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "9876543210",
    "address": "456 Oak St",
    "additionalDocument": {
      "imageUrl": "https://example.com/estimation.jpg",
      "public_id": "estimation_123"
    },
    "estimations": [
      {
        "name": "Kitchen Renovation",
        "rates": {
          "high": 50000,
          "mid": 35000,
          "low": 25000
        },
        "vat": true,
        "hasDimensions": true,
        "selectedRate": "mid",
        "rows": [
          {
            "length": 10,
            "width": 8,
            "quantity": 1
          }
        ]
      }
    ]
  }'
```

### Get All Estimations
```bash
curl -X GET http://localhost:3000/api/estimations
```

## Feedback Endpoints

### Create Feedback
```bash
curl -X POST http://localhost:3000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "message": "Great service! Very professional team.",
    "rating": 5,
    "images": [
      {
        "imageUrl": "https://example.com/feedback1.jpg",
        "public_id": "feedback_img_123"
      }
    ],
    "videos": [
      {
        "url": "https://example.com/feedback_video.mp4",
        "public_id": "feedback_vid_123"
      }
    ]
  }'
```

### Get All Feedbacks
```bash
curl -X GET http://localhost:3000/api/feedback
```

### Get Feedback by ID
```bash
curl -X GET http://localhost:3000/api/feedback/feedback_id_here
```

### Update Feedback
```bash
curl -X PUT http://localhost:3000/api/feedback/feedback_id_here \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Updated feedback message",
    "rating": 4,
    "images": [
      {
        "imageUrl": "https://example.com/new_feedback.jpg",
        "public_id": "new_feedback_img_123"
      }
    ]
  }'
```

### Delete Feedback
```bash
curl -X DELETE http://localhost:3000/api/feedback/feedback_id_here
``` 