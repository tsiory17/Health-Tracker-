

# 🩺 Health Tracker Features & Vitals Logic — Summary

## ✅ 1. Should users update vitals weekly?

* Yes, but optional.
* Use wording like: **“For better accuracy, update your vitals weekly.”**
* Avoid forcing users or making medical claims.

---

## ✅ 2. Can the app show if health is deteriorating?

* No medical diagnosis.
* But you *can* show:

  * Trends (up/down)
  * Color-coded zones (green/yellow/red)
  * Comparison to public health ranges
* Use wording like:

  * **“Above recommended range”**
  * **“Yellow zone”**
  * **“Trend increasing”**

---

## 🟩🟨🟥 3. Safe Color Zone System (Recommended)

### **BMI Categories (WHO)**

| BMI       | Color  | Meaning     |
| --------- | ------ | ----------- |
| < 18.5    | Yellow | Underweight |
| 18.5–24.9 | Green  | Normal      |
| 25–29.9   | Yellow | Overweight  |
| ≥ 30      | Red    | Obese       |

---

### **Heart Rate Ranges (Typical Adults)**

| Range (bpm) | Color  | Meaning               |
| ----------- | ------ | --------------------- |
| 60–100      | Green  | Normal                |
| 100–120     | Yellow | Slightly elevated     |
| >120 or <50 | Red    | Outside typical range |

---

### **Blood Pressure (AHA Guideline)**

| Category       | Systolic / Diastolic | Color  |
| -------------- | -------------------- | ------ |
| Normal         | <120 / <80           | Green  |
| Elevated       | 120–129 / <80        | Yellow |
| High (Stage 1) | ≥130 / ≥80           | Red    |

---

## ✅ 4. BMI Calculation (on first-time input)

```text
BMI = weight(kg) / (height(m)^2)
```

Store the BMI and show:

* Category
* Color zone
* History trend

---

## 📊 5. Recommended Charts

* **Vitals History Chart**

  * Heart rate, BP, etc. with colored background zones
* **BMI Trend Chart**

  * Line chart across weeks/months
* **Medication Schedule**

  * Daily dose checklist

---

## ❌ 6. What the app should avoid

* Do not diagnose or say “your health is deteriorating.”
* Do not imply medical danger.

---

## ✔ 7. Safe wording to use

* **“This value is above recommended range.”**
* **“You are in the yellow zone.”**
* **“Trend increasing over last 3 readings.”**
* **“Consider consulting a health professional.”**

---

If you want, I can now create:

* A clean architecture for the backend
* SQL or MongoDB database tables
* Angular UI layout for these charts
* Color-zone logic in TypeScript

Just tell me what you want next.
