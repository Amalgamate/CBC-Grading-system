# SMS Parent Notification Implementation Plan

**Document Date:** January 31, 2026  
**Target System:** EDucore (c:\Amalgamate\Projects\EDucore)  
**SMS Provider:** MobileSasa  
**Scope:** Assessment publishing to parent SMS notifications with competency tracking  
**Timeline:** 4 weeks | **Effort:** 120 development hours | **Risk:** Low (non-blocking, optional)

---

## EXECUTIVE SUMMARY

This plan outlines the integration of CBC-compliant SMS notifications when assessments are published to parents. The system will:

1. Automatically send templated SMS to parent/guardian on assessment publish
2. Include competency-based messaging (not scores)
3. Audit all SMS with full tracking and compliance data
4. Rate-limit notifications to prevent spam
5. Link to secure parent portal report access

---

## 1. Overview
This document outlines the implementation strategy for SMS parent notifications in EDucore, enabling schools to send automated SMS messages to parents regarding student activities, attendance, grades, and important announcements with full CBC competency compliance.

## 2. Objectives
- Provide real-time communication channel to parents via CBC-compliant competency updates
- Improve parent engagement and awareness of learner progress
- Reduce manual notification workload for staff
- Ensure compliance with data protection regulations (GDPR, FERPA, Kenya DPA)
- Track notification delivery and status with comprehensive audit trails
- Support MobileSasa SMS gateway integration
- Enable assessment publishing workflows with automatic parent notifications

## 3. System Architecture

### 3.1 Components
- **SMS Gateway Integration**: MobileSasa API for SMS delivery
- **Notification Service**: Core notification processing engine with CBC templates
- **Template Management**: Pre-configured CBC-compliant message templates
- **Scheduling Engine**: Scheduled and triggered notifications
- **Audit & Logging**: Message history, delivery tracking, and compliance data
- **User Preferences**: Parent opt-in/opt-out settings and rate limiting
- **Assessment Publishing Trigger**: Integration with assessment publish workflow

### 3.2 Data Flow
1. Assessment published (Formative, Summative, Core Competency, Values)
2. System retrieves learner and parent contact data
3. CBC competency mapping determines message type
4. Template selection based on achievement level (Exceeding, Achieving, Developing)
5. Shortened portal link generation for report access
6. SMS gateway submission via MobileSasa API
7. Delivery status tracking and webhook handling
8. Comprehensive audit log recording

## 4. Technical Implementation

### 4.1 Database Schema

#### AssessmentSmsAudit Table
```prisma
model AssessmentSmsAudit {
  id                    String      @id @default(cuid())
  
  // Learning context
  learnerId             String
  learner               Learner     @relation(fields: [learnerId], references: [id], onDelete: Cascade)
  
  // Assessment context
  assessmentId          String?
  assessmentType        String      // FORMATIVE, SUMMATIVE, CORE_COMPETENCY, VALUES
  
  // Recipient details
  parentId              String?
  parentPhone           String      // Normalized (254712345678)
  parentName            String?
  learnerName           String
  learnerGrade          String
  
  // CBC-specific content
  competencyName        String?     // Communication, Critical Thinking, etc.
  achievementLevel      String?     // Exceeding, Achieving, Developing
  subStrand             String?     // Specific area in competency
  templateType          String      // FORMATIVE_EXCEEDING, SUMMATIVE_TERM, ALERT_CRITICAL, etc.
  
  // Message tracking
  messageContent        String      // Full SMS text (for audit)
  smsMessageId          String?     // MobileSasa API response ID
  reportLink            String?     // Shortened URL to parent portal
  
  // Delivery status
  smsStatus             String      // QUEUED, SENT, DELIVERED, FAILED, BOUNCED
  sentAt                DateTime    @default(now())
  deliveredAt           DateTime?
  failureReason         String?     // "Invalid phone", "Quota exceeded", etc.
  
  // Audit trail
  sentByUserId          String?     // Teacher/Admin who triggered publish
  cooldownExpiry        DateTime?   // When next SMS to this parent allowed
  
  // Relationships
  tenantId              String
  schoolId              String
  
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt
  
  @@index([learnerId])
  @@index([parentPhone])
  @@index([sentAt])
  @@index([smsStatus])
  @@index([schoolId])
}
```

#### Extended Learner Model
```prisma
model Learner {
  // ... existing fields ...
  smsAudits             AssessmentSmsAudit[]
}
```

#### Parent Phone Numbers Table
- `parentPhoneNumbers`: Store verified parent contact information
- Fields: parentId, phone, isVerified, isOptedIn, phoneType (Primary/Secondary)

#### Notification Templates Table
- `notificationTemplates`: CBC-compliant message templates with placeholders
- Fields: templateType, competency, achievementLevel, messageText, locale

#### Notification Preferences Table
- `notificationPreferences`: Parent communication preferences
- Fields: parentId, schoolId, smsEnabled, dailyLimit, quietHours, optOutReasons

### 4.2 API Endpoints

#### SMS Notification Endpoints
- `POST /api/notifications/sms/send`: Send immediate SMS to parent
- `POST /api/notifications/sms/schedule`: Schedule SMS for later
- `POST /api/notifications/sms/assessment-publish`: Trigger SMS on assessment publish
- `GET /api/notifications/sms/status/{id}`: Check delivery status
- `GET /api/notifications/sms/logs`: Retrieve notification history with filters
- `GET /api/notifications/sms/audit-report`: Generate compliance audit report
- `PUT /api/notifications/preferences`: Update parent preferences
- `POST /api/notifications/sms/webhook`: Handle MobileSasa delivery callbacks

#### Assessment Publishing Integration
- `POST /api/assessments/publish`: Publish assessment with SMS trigger
- `POST /api/assessments/{id}/notify-parents`: Manually trigger parent SMS

### 4.3 CBC Message Templates

#### Template Categories
- **Formative Exceeding**: Celebrating competency excellence in formative assessment
- **Formative Achieving**: Positive reinforcement for meeting competency standards
- **Formative Developing**: Supportive messaging for developing competencies
- **Summative Term**: Term-end competency summary
- **Critical Alert**: Learner requires urgent support in key competency
- **Values Assessment**: Character and values development feedback
- **Announcement**: School-wide or class announcements

#### Template Examples
```
FORMATIVE_EXCEEDING:
"Hi {parentName}, great news! {learnerName} (Gr {grade}) is Exceeding in {competency}: {subStrand}. 
View full report: {reportLink}"

FORMATIVE_DEVELOPING:
"Hi {parentName}, {learnerName} is Developing in {competency}. 
Let's support their growth. Details: {reportLink}"

SUMMATIVE_TERM:
"{learnerName}'s Term {term} competency report is ready. 
{competency}: {achievementLevel}. View more: {reportLink}"

ALERT_CRITICAL:
"Important: {learnerName} needs support in {competency}. 
Please see: {reportLink}"
```

## 5. MobileSasa Integration

### 5.1 API Configuration
- **Endpoint**: `https://api.mobilesasa.com/v1/sms/send`
- **Authentication**: API Key in Authorization header
- **Rate Limit**: 100 SMS/minute per account
- **Webhook**: Handle delivery callbacks at `/api/notifications/sms/webhook`

### 5.2 Request Format
```json
{
  "to": "254712345678",
  "message": "SMS message text",
  "sender_id": "EDUCORE",
  "type": "normal"
}
```

### 5.3 Response Handling
```json
{
  "status": "success",
  "message_id": "msg_abc123xyz",
  "cost": 0.25,
  "remaining_balance": 1234.50
}
```

### 5.4 Webhook Integration
- Receive `DELIVERED`, `FAILED`, `BOUNCED` status updates
- Validate webhook signatures
- Update AssessmentSmsAudit table with delivery confirmation
- Implement retry logic for failed messages

## 6. Integration Points

### 6.1 Student Information System
- Access student enrollment and parent contact data
- Validate and normalize phone numbers (Kenya format: 254XXXXXXXXX)
- Cross-reference parent records
- Support multiple parent/guardian contacts

### 6.2 Attendance Module
- Trigger SMS on absence (with rate limiting)
- Configurable delay before notification (1-24 hours)
- Duplicate prevention (same-day same-student)
- Respect parent opt-out preferences

### 6.3 Assessment & Gradebook Module
- Trigger SMS on assessment/grade publishing
- CBC competency-based messaging (not numeric scores)
- Achievement level mapping (Exceeding/Achieving/Developing)
- Automatic portal link generation
- Support for formative and summative assessments

### 6.4 Announcements Module
- Bulk SMS distribution capability
- Parent targeting by class/grade level/competency area
- Scheduled batch sending with staggered delivery
- Cost tracking and quota management

## 7. Security & Compliance

### 7.1 Data Protection
- Encrypt phone numbers at rest (AES-256) and in transit (TLS 1.3)
- PII handling compliance (GDPR, FERPA, Kenya Data Protection Act)
- Comprehensive audit trails for all operations
- Access control and role-based permissions (Teacher, Admin, Principal)
- Right to be forgotten: Archive SMS data after retention period

### 7.2 Fraud Prevention
- Rate limiting on API endpoints (per school, per parent)
- Phone number verification via OTP before first SMS
- Cost controls and usage monitoring per school
- Daily/monthly SMS quota limits configurable per school
- Anomaly detection for unusual patterns

### 7.3 SMS Provider Security
- Use encrypted API credentials (environment variables, vault storage)
- Implement webhook signature validation (HMAC-SHA256)
- TLS/SSL 1.3 for all MobileSasa communications
- IP whitelisting for webhook endpoints
- Regular security audits of SMS content

### 7.4 Compliance Logging
- Log all SMS send requests with user, timestamp, content
- Track delivery status and failure reasons
- Document parent consent and preferences
- Maintain audit report capability for compliance review
- Retention: 12 months for SMS metadata, 6 months for message content

## 8. User Interface Components

### 8.1 Admin Panel
- SMS template configuration and testing
- Notification batch sending with dry-run preview
- Delivery status dashboard with real-time metrics
- Cost and usage reports per school/teacher
- Parent opt-in/opt-out management
- Compliance audit report generation
- MobileSasa account balance and quota monitoring

### 8.2 Parent Portal
- SMS preference management (enable/disable, quiet hours)
- Opt-in/opt-out settings per notification type
- Notification history viewing
- Phone number management and verification
- Report access linked from SMS messages

### 8.3 Teacher Dashboard
- Send manual SMS to parents (with template selection)
- View notification history for their class
- Template preview before sending
- Bulk parent notification capability
- Assessment publish with auto-SMS toggle

## 9. Implementation Phases

### Phase 1: Core Infrastructure (Week 1)
- [ ] Set up MobileSasa API account and credentials
- [ ] Create database schema (AssessmentSmsAudit, templates, preferences)
- [ ] Implement SMS notification service with MobileSasa integration
- [ ] Create API endpoints for SMS operations
- [ ] Set up webhook handling for delivery callbacks
- [ ] Implement phone number validation and normalization

### Phase 2: Templates & Assessment Integration (Week 2)
- [ ] Build CBC-compliant notification templates
- [ ] Integrate with assessment publishing workflow
- [ ] Map competencies to achievement levels
- [ ] Implement portal link generation
- [ ] Create rate limiting and cooldown logic
- [ ] Set up MobileSasa webhook signature validation

### Phase 3: User Interface & Admin Tools (Week 3)
- [ ] Develop admin panel (templates, batch sending, dashboards)
- [ ] Build parent portal SMS preference management
- [ ] Create teacher notification interface
- [ ] Implement compliance audit report generation
- [ ] Build cost tracking and quota monitoring

### Phase 4: Testing & Optimization (Week 4)
- [ ] Unit tests for SMS service and templates
- [ ] Integration tests with MobileSasa sandbox
- [ ] E2E tests for assessment publish workflow
- [ ] Load testing for batch operations
- [ ] Security penetration testing
- [ ] Compliance review (GDPR, FERPA, Kenya DPA)
- [ ] Production deployment and monitoring setup

## 10. Testing Strategy
- Unit tests for notification service with MobileSasa mocking
- Integration tests with MobileSasa sandbox environment
- E2E tests for full assessment-to-SMS workflow
- Phone number validation and normalization tests
- Template rendering with various competency/achievement combinations
- Load testing for bulk SMS operations (1000+ messages)
- Webhook signature validation and delivery status tests
- Security penetration testing for API endpoints
- Compliance data retention and audit trail tests

## 11. Monitoring & Maintenance

### 11.1 Key Metrics
- SMS delivery rate (target > 98%)
- Average delivery time (< 30 seconds)
- Failed message retry rate
- API response time (< 500ms)
- Parent opt-in rate
- Cost per SMS sent
- System uptime (> 99.5%)

### 11.2 Operations
- Failed delivery retry mechanism (exponential backoff, max 3 attempts)
- API response time monitoring with alerts
- Cost tracking and alerts for budget overages
- Regular security audits (quarterly)
- MobileSasa account health monitoring
- Webhook error logging and alerting

## 12. Configuration

### 12.1 School-Level Settings
- SMS feature enabled/disabled
- Daily SMS quota per school
- Rate limits (messages per parent per day/week)
- Quiet hours (no SMS before 06:00, after 21:00)
- Default notification types (Formative, Summative, Alerts)
- MobileSasa account credentials (per multi-tenant school)

### 12.2 Template Customization
- School can customize message templates
- CBC competency mapping per curriculum version
- Achievement level thresholds
- Portal link branding/shortening
- Locale/language selection

### 12.3 Parent Preferences
- Opt-in/opt-out per notification type
- Notification frequency preferences
- Quiet hours customization
- Phone number verification status
- Consent audit trail

## 13. Success Metrics
- SMS delivery rate > 98%
- Parent engagement increase (measure via portal visits post-SMS)
- Reduction in manual notifications
- Parent satisfaction survey scores > 4/5
- System uptime > 99.5%
- Assessment publish time increase < 2 seconds
- Cost per SMS < KES 5
- 80% parent opt-in rate within 3 months

## 14. Risks & Mitigation
| Risk | Mitigation |
|------|-----------|
| MobileSasa API downtime | Implement failover to backup SMS provider (e.g., Twilio) |
| High SMS costs | Set strict daily/monthly quotas, monitor usage trends |
| Invalid/outdated phone numbers | Validation on entry, bounce handling, OTP verification |
| Compliance violations (GDPR/Kenya DPA) | Legal review, audit trail maintenance, data retention policies |
| Low parent adoption | Educational SMS campaigns, clear value messaging, easy opt-in |
| SMS content perceived as spam | Rate limiting, clear sender ID (EDUCORE), opt-out mechanism |
| Webhook delivery failures | Implement retry logic, CloudWatch monitoring, alerting |
| Multi-tenant data isolation | Tenant field on all records, row-level security policies |

## 15. Dependencies & Assumptions
- MobileSasa account with API access (confirmed available)
- Parent phone numbers collected and verified during enrollment
- Assessment system supports competency-based evaluation
- Parent portal exists and can generate secure report links
- Multi-tenant data isolation implemented at database level
- User authentication and role-based access control in place

## 16. Rollout Strategy
1. **Pilot Phase**: Test with 1-2 schools (2 weeks)
2. **Beta Phase**: Limited rollout to 5-10 schools, gather feedback (1 week)
3. **General Availability**: Full release to all schools
4. **Monitor**: Track metrics, address issues, iterate templates

---

**Appendices:**
- MobileSasa API Documentation Reference
- CBC Competency Mapping Tables
- Template Library (by competency and achievement level)
- Compliance Checklist (GDPR, FERPA, Kenya DPA)
- Cost Estimation & Budget Planning

