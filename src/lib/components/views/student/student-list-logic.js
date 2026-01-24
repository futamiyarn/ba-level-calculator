import { calculateTotalExpNeeded } from '$lib/utils/StudentCalculator';

/**
 * Generates a group name based on the index (A, B, C...).
 * @param {number} index - The index of the student group.
 * @returns {string} The group name (e.g., "A", "B").
 */
export const getGroupName = (index) => String.fromCharCode(65 + index);

/**
 * Calculates the specific student EXP needed for the subtitle.
 * @param {object} student - The student object.
 * @param {number} senseiLevel - The current Sensei level cap.
 * @returns {string} The formatted total EXP string.
 */
export const getStudentExpNeeded = (student, senseiLevel) => {
	const effectiveTarget = Math.min(student.targetLevel, senseiLevel);
	const needed = calculateTotalExpNeeded(student.currentLevel, effectiveTarget, student.currentExp);
	return (needed * (student.count || 1)).toLocaleString();
};

/**
 * Updates the student count with boundaries.
 * @param {object} student - The student object to update.
 * @param {number} change - The amount to change the count by.
 * @returns {object} The updated student object.
 */
export const calculateNewCount = (student, change) => {
	let newCount = (student.count || 1) + change;
	if (newCount < 1) newCount = 1;
	return { ...student, count: newCount };
};
