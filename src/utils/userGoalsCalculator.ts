export function calculateUserGoals(userProfile: any) {
    const { weight, height, age, gender, activityLevel } = userProfile;

    // Basic BMR calculation (Mifflin-St Jeor Equation)
    let bmr;
    if (gender === 'male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Activity factor
    const activityFactors = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        veryActive: 1.9
    };
    const tdee = bmr * activityFactors[activityLevel || 'moderate'];

    // Goals
    const calorieGoal = Math.round(tdee);
    const proteinGoal = Math.round(weight * 1.6); // 1.6g per kg of body weight
    const fatGoal = Math.round((tdee * 0.25) / 9); // 25% of calories from fat
    const carbGoal = Math.round((tdee - (proteinGoal * 4 + fatGoal * 9)) / 4);
    const waterGoal = Math.round(weight * 0.033 * 10) / 10; // 33ml per kg of body weight

    return { calorieGoal, proteinGoal, fatGoal, carbGoal, waterGoal };
}