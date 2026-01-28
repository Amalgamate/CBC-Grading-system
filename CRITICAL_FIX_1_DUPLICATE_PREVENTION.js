// This file contains the updated handleSave function with duplicate mark prevention
// Copy this function to replace the existing handleSave in your SummativeAssessment component

const handleSave = async () => {
  if (Object.keys(marks).length === 0) {
    showError('No marks entered to save');
    return;
  }

  try {
    setLoading(true);

    // 🚨 CRITICAL FIX #1: Check for existing results before saving
    const existingResultsResponse = await assessmentAPI.getTestResults(selectedTestId);
    const existingResults = existingResultsResponse.data || existingResultsResponse || [];

    if (existingResults.length > 0) {
      // Check if any of these results are published
      const publishedCount = existingResults.filter(r => 
        r.status === 'PUBLISHED' || r.status === 'published'
      ).length;

      let confirmMessage = '';
      let confirmTitle = '';

      if (publishedCount > 0) {
        confirmTitle = '⚠️ Warning: Published Results Exist';
        confirmMessage = `This test has ${publishedCount} published result(s). Overwriting will affect report cards and student records.\n\nExisting results: ${existingResults.length} learner(s)\nNew marks to save: ${Object.keys(marks).length} learner(s)\n\nAre you sure you want to overwrite these results?`;
      } else {
        confirmTitle = '⚠️ Results Already Exist';
        confirmMessage = `Results already exist for ${existingResults.length} learner(s) in this test.\n\nDo you want to overwrite them with your current entries?`;
      }

      // Show confirmation dialog
      const userConfirmed = window.confirm(`${confirmTitle}\n\n${confirmMessage}`);
      
      if (!userConfirmed) {
        setLoading(false);
        showError('Save cancelled - existing results were not overwritten');
        return;
      }

      // User confirmed, show warning message
      showSuccess('Overwriting existing results...');
    }

    // Prepare bulk payload
    const resultsToSave = Object.entries(marks).map(([learnerId, mark]) => {
      let remarks = '-';
      if (selectedTest?.totalMarks) {
        const percentage = (mark / selectedTest.totalMarks) * 100;
        if (gradingScale && gradingScale.ranges) {
          const range = gradingScale.ranges.find(r => percentage >= r.minPercentage && percentage <= r.maxPercentage);
          remarks = range ? range.label : '-';
        }
      }

      return {
        learnerId,
        marksObtained: mark,
        remarks,
        teacherComment: `Score: ${mark}/${selectedTest?.totalMarks}`
      };
    });

    // Send bulk request
    await assessmentAPI.recordBulkResults({
      testId: selectedTestId,
      results: resultsToSave
    });

    showSuccess(`Successfully saved marks for ${resultsToSave.length} learner(s)!`);
  } catch (error) {
    console.error('Save error:', error);
    showError('Failed to save marks');
  } finally {
    setLoading(false);
  }
};
