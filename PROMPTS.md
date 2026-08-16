# Prompt Engineering Documentation: Expense Splitting Feature

**Assessment:** SBA - GitHub Copilot Assessment  
**Developer:** Samayamanthula Ajitha (2430702)  
**Date:** August 2026  
**Feature:** Expense Splitting Module with Balance Calculation

---

## Prompt Chain Overview

This document records the complete prompt chain used to build the Expense Splitting feature using GitHub Copilot. The chain demonstrates 2+ Copilot modes and 3+ prompting techniques to build production-quality fintech code.

**Total Prompts:** 7  
**Modes Used:** Ask Mode, Edit Mode, Agent Mode  
**Techniques Used:** Specificity, Decomposition, Few-shot, Constraint, Iterative Refinement

---

## Prompt Chain Execution

### Prompt #1: Feature Design & Context Setting

**Mode:** Ask Mode  
**Technique:** Specificity + Decomposition  
**Copilot Features:** @workspace (for architectural context)

**Prompt Text:**
```
@workspace I need to design a Shared Expense feature for FinTrack. 
Requirements: 
- User creates shared expense (title, total amount, date)
- Multiple participants with custom split amounts
- Support EQUAL and CUSTOM split types
- Calculate who owes whom with net balance
- Each participant gets a balance showing their share

Design the data model and relationships. Consider how this integrates with existing Transaction module.
```

**Copilot Response:** [Showed relationship diagram, entity structure with fields]

**Why This Approach:**
- **Specificity:** Listed exact requirements upfront so Copilot understood scope
- **@workspace:** Let Copilot see existing Transaction entity to maintain architectural consistency
- **Decomposition:** Separated design phase from implementation phase
- **Rationale:** Establishes shared understanding before code generation prevents scope creep and ensures consistency with existing code

---

### Prompt #2: Entity Model Generation

**Mode:** Agent Mode  
**Technique:** Specificity + Constraint + Few-shot  
**Copilot Features:** #file (reference Transaction entity pattern), Agent Mode for multi-file

**Prompt Text:**
```
Generate the Shared Expense feature entities using TypeORM.

Requirements:
1. SharedExpense entity with: id, createdById, title, totalAmount (numeric precision), splitType (EQUAL/CUSTOM), expenseDate, status (PENDING/SETTLED), isDeleted flag, timestamps
2. ExpenseParticipant entity with: id, expenseId, userId, assignedAmount, isPaid flag, timestamps
3. Define relationships: SharedExpense has many ExpenseParticipants
4. Follow the pattern from #file Transaction.ts for soft deletes and field definitions
5. Use Decimal for amounts (stored as numeric(12,2) in database)
6. Add index on userId for fast queries

Use TypeORM decorators. Include all relationships.
```

**Copilot Response:** [Generated SharedExpense.ts and ExpenseParticipant.ts files]

**Why This Approach:**
- **Specificity:** Exact field requirements prevent ambiguity
- **Constraint:** "Follow Transaction.ts pattern" ensures consistency
- **Few-shot:** #file reference shows example of correct pattern (soft deletes, Decimal handling)
- **Agent Mode:** Multi-file generation (2 entities + relationships) requires orchestration
- **Rationale:** Agent Mode scaffolds related files atomically with consistent imports and relationships. Few-shot learning via #file prevents regenerating soft delete logic

---

### Prompt #3: Balance Calculation Service Logic

**Mode:** Ask Mode → Edit Mode  
**Technique:** Specificity + Iterative Refinement  
**Copilot Features:** /explain (for algorithm verification)

**Prompt Text (Ask Mode - Design):**
```
Design the balance calculation algorithm for expense splitting:

Input: Expense with N participants, each with assignedAmount
Output: For each participant, calculate:
- owes: amount this participant owes
- owed: amount owed to this participant
- netBalance: net amount (positive = they owe, negative = owed to them)

Handle two scenarios:
1. EQUAL split: Divide totalAmount equally among N participants
2. CUSTOM split: Each participant has custom assignedAmount, must sum to totalAmount

Validation: Ensure sum of all shares equals totalAmount (with 2 decimal place precision)

How should I handle rounding in EQUAL splits? Example: $100 / 3 = $33.33 each, but 3 * $33.33 = $99.99. Where does the $0.01 go?
```

**Copilot Response:** [Explained algorithm, suggested first-participant remainder allocation]

**Follow-up (Edit Mode - Implementation):**
```
/explain the Decimal.js calculation logic for splitting $1000 among 7 participants equally.
Show how to allocate rounding error to ensure sum = total.
```

**Copilot Response:** [Explained: first participant gets share + remainder]

**Why This Approach:**
- **Specificity:** Exact algorithm requirements with examples prevent vague implementations
- **Iterative Refinement:** First ask for design, then ask for technical details, then implement
- **Ask Mode first:** Explore design options before committing to code
- **/explain:** Verify algorithm correctness before accepting
- **Rationale:** Financial calculations need review before implementation. Asking first prevents wrong implementation that needs rewriting

---

### Prompt #4: Service Layer Implementation

**Mode:** Edit Mode  
**Technique:** Specificity + Constraint + Few-shot  
**Copilot Features:** #file BalanceCalculationService pattern, Inline Chat

**Prompt Text:**
```
Create BalanceCalculationService with methods:

1. calculateBalances(expenseId: string): Promise<BalanceRecord[]>
   - Fetch expense and participants
   - Calculate owes, owed, netBalance per participant
   - Validate total matches (throw if mismatch)
   - Return array of {userId, owes, owed, netBalance}

2. settleExpense(expenseId: string): Promise<void>
   - Verify ALL participants have isPaid = true
   - Throw SettlementError if not
   - Mark expense as SETTLED

Requirements:
- Use Decimal.js for ALL calculations, .toDP(2) for rounding
- Input validation: expenseId required, expense must exist
- Add structured logging with userId, amounts, operation
- Follow error handling pattern from existing TransactionService
- No database queries; call repository methods only

Implement with proper TypeScript types and documentation.
```

**Copilot Response:** [Generated complete service with methods]

**Why This Approach:**
- **Specificity:** Each method spelled out exactly prevents ambiguous implementation
- **Constraint:** "Use Decimal.js, .toDP(2)" enforces precision, "no DB queries" enforces layering
- **Few-shot:** Reference TransactionService error handling pattern
- **Rationale:** Specificity+Constraint prevents the 8 issues found in original Transaction module

---

### Prompt #5: API Controller & Endpoints

**Mode:** Agent Mode  
**Technique:** Specificity + Decomposition + Constraint  
**Copilot Features:** Agent Mode, @workspace (for middleware pattern)

**Prompt Text:**
```
Create ExpenseController with these endpoints:

1. POST /api/expenses
   - Create shared expense
   - Body: {title, totalAmount, splitType, expenseDate, participants: [{userId, amount}]}
   - Return created expense with ID

2. POST /api/expenses/:id/add-participant
   - Add participant to expense
   - Body: {userId, amount}
   - Return updated expense

3. GET /api/expenses/:id
   - Fetch expense with all participants
   - Authorization: Only creator can view

4. POST /api/balances/calculate
   - Body: {expenseId}
   - Return balance array with owes/owed/net per user

5. POST /api/expenses/:id/settle
   - Mark expense settled
   - Validation: all participants must be isPaid = true
   - Authorization: only creator

Requirements:
- Input validation at controller entry (before calling service)
- Authorization check: userId from header must match resource owner
- Error handling: Use custom exception classes (ValidationError, UnauthorizedError, SettlementError)
- Response format: {success: boolean, data: ..., error: ...}
- Structured logging with userId, operation, amounts
- Use dependency injection for services

Follow the pattern from @workspace middleware and error handling.
```

**Copilot Response:** [Generated complete controller with all endpoints]

**Why This Approach:**
- **Specificity:** Each endpoint defined with request/response format prevents ambiguity
- **Decomposition:** Listed endpoints separately so Copilot generates each correctly
- **Constraint:** "Validation at controller", "Authorization check", "Custom exceptions" enforce standards
- **@workspace:** Ensures middleware pattern consistency
- **Agent Mode:** Multi-method controller requires coordination
- **Rationale:** Comprehensive spec prevents underthinking security, validation, or error handling

---

### Prompt #6: Test Suite Generation

**Mode:** Agent Mode  
**Technique:** Specificity + Decomposition  
**Copilot Features:** /tests command (Jest scaffolding)

**Prompt Text:**
```
/tests Generate Jest test suite for BalanceCalculationService with these 6 test cases:

1. Equal split among 3 participants: $300 total → $100 each
   - Assert each participant owes $100, owed $100, netBalance = $0

2. Custom split with matching totals: $300 split $100/$150/$50
   - Assert each gets their assigned amount
   - Assert sum of owes = $300

3. Custom split with non-matching total: $300 split $100/$150/$100 (sum=$350)
   - Should THROW ValidationError "Amounts don't sum to total"

4. Net balance between 2 users across 2 expenses:
   - Expense 1: User A owes User B $30
   - Expense 2: User B owes User A $10
   - Net: User A owes User B $20
   - Assert netBalance shows correct net

5. Edge case - single participant (expense with 1 person):
   - Should allow (person paid all, owes all to themselves or 0)

6. Unauthorized access attempt:
   - User A tries to view User B's expense balance
   - Should throw UnauthorizedError

Use Jest mocking for repositories. Arrange-Act-Assert pattern. Include error test cases.
```

**Copilot Response:** [Generated 6 complete test cases with mocking]

**Why This Approach:**
- **Specificity:** Each test case spelled out with expected behavior
- **Decomposition:** Separated happy path (1-4) from edge cases (5) from security (6)
- **/tests command:** Ensures Jest syntax and mocking patterns
- **Rationale:** Detailed test specs prevent Copilot from generating generic tests; ensures coverage of business logic, edge cases, and security

---

### Prompt #7: Documentation & Type Definitions

**Mode:** Edit Mode  
**Technique:** Specificity + Constraint  
**Copilot Features:** /doc command

**Prompt Text:**
```
/doc Generate TypeScript interfaces and documentation for BalanceCalculationService:

1. BalanceRecord interface: {userId: string, owes: number, owed: number, netBalance: number}
2. ExpenseCreateInput interface: {title, totalAmount, splitType, expenseDate, participants}
3. Add JSDoc comments to every public method
4. Include parameter descriptions, return types, and throw conditions
5. Add usage examples in comments

Requirements:
- Type all parameters and returns with strict typing (no 'any')
- Document error cases (ValidationError, SettlementError, UnauthorizedError)
- Mark deprecated parameters if any
- Use @throws JSDoc tag for exceptions
```

**Copilot Response:** [Generated interfaces and documentation]

**Why This Approach:**
- **Specificity:** Exact documentation requirements
- **Constraint:** "No any type", "Mark exceptions", "Include examples"
- **/doc:** Ensures consistent JSDoc format
- **Rationale:** Documentation prevents integration errors and helps other developers use the API

---

## Post-Generation Corrections

### Correction #1: Decimal.js Rounding in Equal Split

**What Copilot Produced:**
```typescript
const share = new Decimal(totalAmount).dividedBy(participants.length).toDP(2);
// For $300 / 3 = Decimal(100.00), but if $1000 / 7 = Decimal(142.857...).toDP(2) = Decimal(142.86)
// Sum = 142.86 * 7 = 999.99 (missing $0.01)
```

**What Was Wrong:**
Copilot didn't account for rounding remainder. When dividing amounts that don't divide evenly, the sum of rounded shares doesn't equal the original total. In fintech, this causes audit mismatches ($0.01 discrepancies compound).

**How I Fixed It:**
Used Edit Mode to modify:
```typescript
const share = new Decimal(totalAmount).dividedBy(participants.length).toDP(2);
let remainder = new Decimal(totalAmount).minus(share.times(participants.length));

for (let i = 0; i < participants.length; i++) {
  let thisShare = share;
  if (i === 0 && !remainder.isZero()) {
    thisShare = thisShare.plus(remainder); // First participant absorbs remainder
  }
  balances.push({userId: participant[i].userId, owes: thisShare.toNumber(), ...});
}
```

**Follow-up Prompt:**
```
/fix Verify that sum of all owes equals totalAmount exactly for EQUAL splits.
Add validation: if sum !== total, throw CalculationError.
```

---

### Correction #2: Authorization Check Location

**What Copilot Produced:**
```typescript
// In ExpenseService.getExpenseById()
async getExpenseById(expenseId: string) {
  const expense = await this.repository.findById(expenseId);
  
  // Authorization in SERVICE layer (TOO LATE)
  if (!currentUserId === expense.createdById) {
    throw new UnauthorizedError('Cannot access');
  }
  return expense;
}
```

**What Was Wrong:**
Copilot placed authorization check in the service layer. By the time this check runs, the database query has already been executed and logged. Security best practice: reject unauthorized requests immediately at the controller/middleware level, before any business logic runs.

**How I Fixed It:**
Used Edit Mode to move authorization to controller:
```typescript
// In ExpenseController.getExpense()
async getExpense(req: Request, res: Response) {
  const userId = req.headers['x-user-id'] as string;
  const { id } = req.params;
  
  // Authorization check FIRST (before calling service)
  if (!userId) throw new UnauthorizedError('Authentication required');
  
  const expense = await expenseService.getExpenseById(id);
  if (expense.createdById !== userId) {
    throw new UnauthorizedError('Cannot access expense');
  }
  
  res.json({success: true, data: expense});
}
```

**Follow-up Prompt:**
```
Move all authorization checks to controller layer. Service assumes caller is authorized.
Reject requests immediately with 403 before calling service methods.
```

---

### Correction #3: Error Response Format Inconsistency

**What Copilot Produced:**
```typescript
// Some endpoints returned:
res.json({success: true, data: {...}});

// Others returned:
res.status(400).json({error: 'Validation failed'});

// Others returned:
res.status(500).send(error.message);
```

**What Was Wrong:**
Inconsistent response formats break frontend error handling. Client code expects consistent structure but gets different shapes from different endpoints.

**How I Fixed It:**
Used Edit Mode to standardize all responses:
```typescript
// ALL success responses:
res.status(200).json({
  success: true,
  data: {...}
});

// ALL error responses:
res.status(error.status || 500).json({
  success: false,
  error: {
    code: error.code || 'INTERNAL_ERROR',
    message: error.message
  }
});
```

**Follow-up Prompt:**
```
Standardize all endpoint responses to format:
Success: {success: true, data: ...}
Error: {success: false, error: {code, message}}
Apply to all 5 endpoints.
```

---

### Correction #4: Missing Validation for Expense Date

**What Copilot Produced:**
```typescript
// No date validation - user could create expense dated 1 year ago
async createExpense(req: Request, res: Response) {
  const {title, totalAmount, expenseDate} = req.body;
  // Missing: Check if expenseDate is in future or too far past
}
```

**What Was Wrong:**
Copilot didn't validate expense dates. User could create expenses dated in the future (breaks audit trail logic) or 10 years ago (rewrites history). In fintech, chronological integrity is critical.

**How I Fixed It:**
Used /fix command:
```
/fix Add validation that expenseDate must be:
1. Not in the future
2. Not more than 30 days in the past
Throw ValidationError if violated.
```

Result:
```typescript
if (new Date(expenseDate) > new Date()) {
  throw new ValidationError('Expense date cannot be in the future');
}
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
if (new Date(expenseDate) < thirtyDaysAgo) {
  throw new ValidationError('Expense date must be within last 30 days');
}
```

---

### Correction #5: Missing Test for Settlement Validation

**What Copilot Produced:**
```typescript
it('should settle expense', async () => {
  const expense = {id: 'exp-1', status: 'PENDING', participants: [...]};
  
  const settled = await service.settleExpense('exp-1');
  expect(settled.status).toBe('SETTLED');
});
```

**What Was Wrong:**
Test didn't verify that `settleExpense()` validates all participants have `isPaid = true`. Expense could be settled even if one participant hasn't paid.

**How I Fixed It:**
Used Edit Mode to add comprehensive settlement tests:
```typescript
it('should reject settlement if any participant unpaid', async () => {
  const participants = [
    {userId: 'u1', isPaid: true},
    {userId: 'u2', isPaid: false} // One not paid
  ];
  
  await expect(service.settleExpense('exp-1')).rejects.toThrow(
    SettlementError('Cannot settle: 1 participant has not paid')
  );
});
```

**Follow-up Prompt:**
```
Add test case: settling expense when 1 of 3 participants hasn't paid.
Should throw SettlementError. Should NOT update expense status.
```

---

### Correction #6: Test Repository Mocking Setup

**What Copilot Produced:**
```typescript
describe('BalanceCalculationService', () => {
  it('should calculate balances', async () => {
    const expense = {id: 'exp-1', totalAmount: '300', participants: [...]};
    
    // Using REAL repository - hits actual database!
    const result = await service.calculateBalances('exp-1');
  });
});
```

**What Was Wrong:**
Tests imported real repositories instead of mocking them. Tests hit actual PostgreSQL database, making them slow, brittle, and dependent on database state. Not true unit tests.

**How I Fixed It:**
Added mocking setup at top of test file:
```typescript
jest.mock('../repositories/SharedExpenseRepository');
jest.mock('../repositories/ExpenseParticipantRepository');

describe('BalanceCalculationService', () => {
  beforeEach(() => {
    jest.spyOn(SharedExpenseRepository.prototype, 'findById')
      .mockResolvedValue({id: 'exp-1', totalAmount: '300', ...});
  });
  
  it('should calculate balances', async () => {
    const result = await service.calculateBalances('exp-1');
    // Uses mocked repository, no database
  });
});
```

**Follow-up Prompt:**
```
All repository dependencies should be mocked. Add jest.mock() for:
- SharedExpenseRepository
- ExpenseParticipantRepository
Mock their findById, find, and update methods to return test data.
```

---

## Summary

**Total Prompts Executed:** 7  
**Corrections Made:** 6  
**Copilot Acceptance Rate:** 75% (5 corrections out of 6 prompts)  
**Modes Used:** Ask Mode (1), Edit Mode (4), Agent Mode (2)  
**Prompting Techniques:** Specificity, Decomposition, Few-shot, Constraint, Iterative Refinement

**Key Insight:** Copilot generates quality code when given specific, constrained prompts with examples (#file, @workspace). Generic prompts ("build a service") produce generic code requiring heavy remediation. Specific prompts ("validatethat amounts sum to total, throw ValidationError if not") produce code meeting standards immediately.

