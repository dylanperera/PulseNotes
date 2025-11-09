1. "Layered Architecture"

Organized into horizontal layers, each with a clear responsibility:

    Frontend / View → presentation and user interaction (Electron)

    Controller / API Layer → handles HTTP requests, validation, and routes

    Service Layer → business logic, orchestration, AI pipelines

    Model Layer / Domain Layer → pure data + AI logic (Whisper, LLMs)

    Utilities / Infrastructure → logging, config, database access (if any)

    Each layer only communicates downwards, never directly back up (except for returning results)


MVC is a precursor to layered architectures, but in modern API apps it’s adapted:

Model in MVC → Models + Service Layer.

Controller → same.

View → Electron frontend.

By adding a service layer, we're splitting the Model’s responsibilities: Models handle core AI logic, Services handle orchestration. This is common in modern applications and is considered better for maintainability.
