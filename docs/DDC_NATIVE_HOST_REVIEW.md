# DDC Review — Native Appearance Host v0.2.0

## Verdict

**PASS WITH BOUNDED RESIDUAL UNCERTAINTY.**

The native reference host demonstrates the intended authority boundary in executable form. It does not prove deployment inside `chatgpt.com`; that still requires a host capability exposed by OpenAI.

## Governed transition

**Authority → Intent → Preconditions → Execution Boundary → Transition → Verification → Invariant Preservation → Evidence → Recovery**

### Authority

The user explicitly approves the requested appearance capabilities before a theme transition. Theme metadata is not treated as authority.

### Intent

Presentation-only change: local background, host-bounded opacity, blur, and decorative gradient.

### Preconditions

- known schema version;
- known capability set;
- every populated field mapped to a granted capability;
- local images restricted to PNG/JPEG/WebP and 5 MB maximum;
- image represented to the provider as an opaque `asset://local/...` handle.

### Execution boundary

The theme/provider submits declarative data only. The host owns:

- validation;
- local asset resolution;
- CSS variable application;
- conversation state;
- functional controls;
- accessibility policy;
- evidence;
- rollback.

The native appearance runtime does not import the chat runtime and contains no external network primitive.

### Transition

A validated request updates only the allowlisted host appearance state. The renderer converts state to seven host-owned presentation tokens. There is no arbitrary CSS, HTML, event-handler, authentication, or control-visibility capability.

### Verification

Automated tests cover valid application, hostile capability rejection, state preservation on rejection, exact rollback, opaque local assets, bounded host tokens, and conversation/appearance independence.

`npm run ddc:audit` additionally performs structural checks over the execution boundary.

### Preserved invariants

- Appearance ≠ Content
- Appearance ≠ Function
- Appearance ≠ Authentication
- Appearance ≠ Execution
- Local asset handle ≠ asset bytes / host object URL
- Rejected transition ≠ state mutation
- Appearance evidence ≠ conversation evidence

### Evidence

Each transition records policy version, requested capabilities, changed appearance fields, status, execution boundary, invariant outcomes, and sequence number without recording conversation text.

### Recovery

The host stores the exact prior appearance state and can restore it with rollback. Asset registry entries can be revoked by the host.

## Residual uncertainty

1. A production implementation should calculate effective contrast against arbitrary imagery and enforce accessibility dynamically.
2. Browser/runtime differences still require production compatibility testing for a deployed host.
3. Integration into ChatGPT itself cannot be validated until OpenAI exposes an appropriate host appearance capability.
