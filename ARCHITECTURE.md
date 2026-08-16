# Architecture

The FinTrack API follows a layered architecture.

Client
→ Routes
→ Controllers
→ Services
→ Repositories
→ Database

The Transaction module manages individual transactions.

The Expense Splitting module uses transaction data to calculate balances between users.

Validation occurs before business logic execution.

Repositories isolate data access concerns.

Services contain financial business rules such as custom split validation and net balance calculation.

Controllers handle HTTP requests and responses.

This architecture improves maintainability, scalability, and security, which are important in fintech systems.
