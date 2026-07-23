CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,

    role ENUM('employee','support','admin') NOT NULL DEFAULT 'employee',

    office VARCHAR(100) NOT NULL,

    phone VARCHAR(30) NULL,

    avatar VARCHAR(255) NULL,

    active TINYINT(1) DEFAULT 1,

    last_login DATETIME NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE tickets (

    id INT AUTO_INCREMENT PRIMARY KEY,

    ticket_number VARCHAR(20) UNIQUE,

    user_id INT NOT NULL,

    assigned_to INT NULL,

    title VARCHAR(200) NOT NULL,

    description TEXT NOT NULL,

    category ENUM(
        'hardware',
        'software',
        'red_internet',
        'correo',
        'impresora',
        'acceso_permisos',
        'otro'
    ) DEFAULT 'otro',

    priority ENUM(
        'baja',
        'media',
        'alta',
        'urgente'
    ) DEFAULT 'media',

    status ENUM(
        'abierto',
        'en_progreso',
        'resuelto',
        'cerrado'
    ) DEFAULT 'abierto',

    office VARCHAR(100),

    is_remote BOOLEAN DEFAULT FALSE,

    anydesk_code VARCHAR(50),

    accepted_at DATETIME NULL,

    resolved_at DATETIME NULL,

    closed_at DATETIME NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY(assigned_to)
        REFERENCES users(id)
        ON DELETE SET NULL
);

CREATE TABLE ticket_events (

    id INT AUTO_INCREMENT PRIMARY KEY,

    ticket_id INT NOT NULL,

    user_id INT NULL,

    event_type ENUM(
        'created',
        'assigned',
        'status_changed',
        'comment',
        'priority_changed',
        'attachment',
        'closed',
        'reopened'
    ),

    old_value VARCHAR(255),

    new_value VARCHAR(255),

    note TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(ticket_id)
        REFERENCES tickets(id)
        ON DELETE CASCADE,

    FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);

CREATE TABLE ticket_files (

    id INT AUTO_INCREMENT PRIMARY KEY,

    ticket_id INT NOT NULL,

    uploaded_by INT NOT NULL,

    file_name VARCHAR(255),

    original_name VARCHAR(255),

    mime_type VARCHAR(100),

    file_size BIGINT,

    storage_path VARCHAR(500),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(ticket_id)
        REFERENCES tickets(id)
        ON DELETE CASCADE,

    FOREIGN KEY(uploaded_by)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_ticket_status
ON tickets(status);

CREATE INDEX idx_ticket_priority
ON tickets(priority);

CREATE INDEX idx_ticket_office
ON tickets(office);

CREATE INDEX idx_ticket_assigned
ON tickets(assigned_to);

CREATE INDEX idx_ticket_user
ON tickets(user_id);

CREATE INDEX idx_ticket_created
ON tickets(created_at);