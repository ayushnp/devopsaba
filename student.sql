-- Add approval columns to marks_student table
ALTER TABLE marks_student 
ADD COLUMN approval_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN approved_by INT,
ADD COLUMN approved_at TIMESTAMPTZ,
ADD COLUMN approval_remarks TEXT;

-- Update existing test records to 'approved' status
UPDATE marks_student SET approval_status = 'approved';

-- Create index for better performance
CREATE INDEX idx_marks_student_approval ON marks_student(approval_status);