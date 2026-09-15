# Nisala Travels - Entity Relationship Diagram

The following diagram illustrates the relational database architecture for the Nisala Travels Management System. It encompasses Authentication, RBAC, CRM, Tour Management, Booking, Payments, and Document Management.

```mermaid
erDiagram
    users {
        bigint id PK
        string name
        string email
        string password
        string status
        timestamp email_verified_at
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    roles {
        bigint id PK
        string name
        string guard_name
    }
    model_has_roles {
        bigint role_id FK
        string model_type
        bigint model_id FK
    }
    employees {
        bigint id PK
        bigint user_id FK
        string employee_id
        string phone
        string department
        date joining_date
        text notes
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    customers {
        bigint id PK
        bigint user_id FK "nullable"
        string customer_id
        string full_name
        string nic "nullable"
        string passport_number "nullable"
        date dob "nullable"
        string gender "nullable"
        string nationality "nullable"
        string phone
        string whatsapp "nullable"
        string email
        text address "nullable"
        string emergency_contact_name "nullable"
        string emergency_contact_phone "nullable"
        string status
        bigint created_by FK
        text notes
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    destinations {
        bigint id PK
        string country
        string city_region
        text description
        text travel_information
        string status
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    tour_packages {
        bigint id PK
        bigint destination_id FK
        string package_name
        text description
        int duration_days
        date start_date
        date end_date
        decimal price
        string currency
        int capacity
        int available_seats
        text hotel_information
        text transportation_information
        text meals
        text included_items
        text excluded_items
        text terms
        string status
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    package_media {
        bigint id PK
        bigint package_id FK
        string file_path
        string media_type
        int display_order
        string caption "nullable"
        timestamp created_at
        timestamp updated_at
    }
    inquiries {
        bigint id PK
        bigint customer_id FK "nullable"
        string name
        string contact_information
        string destination
        string package_interest "nullable"
        date travel_date "nullable"
        int number_of_travelers "nullable"
        text message
        string status
        bigint assigned_to FK "nullable"
        string source
        text follow_up_information "nullable"
        timestamp created_at
        timestamp updated_at
    }
    bookings {
        bigint id PK
        string booking_reference
        bigint customer_id FK
        bigint package_id FK
        bigint assigned_to FK "nullable"
        date booking_date
        date travel_date
        date return_date
        int number_of_travelers
        string booking_status
        string payment_status
        text notes
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    booking_travelers {
        bigint id PK
        bigint booking_id FK
        bigint customer_id FK "nullable"
        string full_name
        date dob "nullable"
        string gender "nullable"
        string nic "nullable"
        string passport_number "nullable"
        string relationship_to_primary "nullable"
        string contact_information "nullable"
        text special_requirements "nullable"
        timestamp created_at
        timestamp updated_at
    }
    document_types {
        bigint id PK
        string name
        string description "nullable"
        boolean is_required
        boolean is_active
        boolean tracks_expiry
        timestamp created_at
        timestamp updated_at
    }
    customer_documents {
        bigint id PK
        bigint customer_id FK
        bigint booking_id FK "nullable"
        bigint document_type_id FK
        string storage_path
        string original_filename
        bigint uploaded_by FK
        date expiry_date "nullable"
        string verification_status
        bigint verified_by FK "nullable"
        timestamp verified_at "nullable"
        text rejection_reason "nullable"
        text notes "nullable"
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    payments {
        bigint id PK
        bigint booking_id FK
        bigint customer_id FK
        decimal amount
        string currency
        string payment_method
        date payment_date
        string reference_number "nullable"
        bigint recorded_by FK
        text notes "nullable"
        string status
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    payment_receipts {
        bigint id PK
        bigint payment_id FK
        string receipt_number
        string file_reference "nullable"
        bigint generated_by FK
        timestamp created_at
        timestamp updated_at
    }
    notifications {
        bigint id PK
        string type
        string notifiable_type
        bigint notifiable_id FK
        text data
        timestamp read_at "nullable"
        timestamp created_at
        timestamp updated_at
    }
    activity_logs {
        bigint id PK
        string log_name "nullable"
        text description
        string subject_type "nullable"
        bigint subject_id FK "nullable"
        string causer_type "nullable"
        bigint causer_id FK "nullable"
        text properties "nullable"
        timestamp created_at
        timestamp updated_at
    }

    users ||--o| employees : "has profile"
    users ||--o| customers : "has profile"
    users ||--o{ model_has_roles : "has roles"
    roles ||--o{ model_has_roles : "assigned to"
    
    customers ||--o{ bookings : "makes"
    customers ||--o{ customer_documents : "owns"
    customers ||--o{ inquiries : "makes"
    customers ||--o{ payments : "makes"
    
    destinations ||--o{ tour_packages : "has"
    tour_packages ||--o{ package_media : "has"
    tour_packages ||--o{ bookings : "booked in"
    
    bookings ||--o{ booking_travelers : "has travelers"
    bookings ||--o{ customer_documents : "requires"
    bookings ||--o{ payments : "has"
    
    document_types ||--o{ customer_documents : "categorizes"
    
    payments ||--o| payment_receipts : "generates"
    
    employees ||--o{ inquiries : "assigned to"
    employees ||--o{ bookings : "assigned to"
```
