import unittest

def calculate_statutory_tds(monthly_gross):
    annual_gross = monthly_gross * 12
    std_ded = 75000
    taxable_income = max(0, annual_gross - std_ded)
    if taxable_income <= 700000:
        return 0
    slabs = [
        (300000, 0.0),
        (400000, 0.05),
        (300000, 0.10),
        (200000, 0.15),
        (300000, 0.20),
        (float("inf"), 0.30),
    ]
    rem = taxable_income
    base_tax = 0.0
    for cap, rate in slabs:
        taxed = min(rem, cap)
        base_tax += taxed * rate
        rem -= taxed
        if rem <= 0:
            break
    cess = base_tax * 0.04
    return round((base_tax + cess) / 12)

def calculate_statutory_payroll(monthly_gross):
    gross = max(0, round(monthly_gross))
    basic = round(gross * 0.60)
    special = gross - basic
    pf = 1800 if gross >= 15000 else min(1800, round(basic * 0.12))
    pt = 200 if gross >= 15000 else 0
    tds = calculate_statutory_tds(gross)
    total_deductions = pf + pt + tds
    net_pay = gross - total_deductions
    return {
        "gross": gross,
        "basic": basic,
        "special": special,
        "pf": pf,
        "pt": pt,
        "tds": tds,
        "total_deductions": total_deductions,
        "net_pay": net_pay,
    }

class TestStatutoryPayroll(unittest.TestCase):
    def test_sumit_salary_rebate(self):
        # Gross 60,000 -> Taxable 6,45,000 <= 7,00,000 -> 0 TDS (Sec 87A Rebate)
        res = calculate_statutory_payroll(60000)
        self.assertEqual(res["tds"], 0)
        self.assertEqual(res["pf"], 1800)
        self.assertEqual(res["pt"], 200)
        self.assertEqual(res["net_pay"], 58000)

    def test_sushmita_salary_tds(self):
        # Gross 65,000 -> Taxable 7,05,000 -> Base Tax 20,500 + 4% cess = 21,320 -> Monthly TDS = 1,777
        res = calculate_statutory_payroll(65000)
        self.assertEqual(res["tds"], 1777)
        self.assertEqual(res["pf"], 1800)
        self.assertEqual(res["pt"], 200)
        self.assertEqual(res["total_deductions"], 3777)
        self.assertEqual(res["net_pay"], 61223)

    def test_tarun_salary_tds(self):
        # Gross 80,000 -> Taxable 8,85,000 -> Monthly TDS = 3,337
        res = calculate_statutory_payroll(80000)
        self.assertEqual(res["tds"], 3337)
        self.assertEqual(res["pf"], 1800)
        self.assertEqual(res["pt"], 200)
        self.assertEqual(res["net_pay"], 74663)

    def test_tejas_salary_tds(self):
        # Gross 95,000 -> Taxable 10,65,000 -> Monthly TDS = 5,178
        res = calculate_statutory_payroll(95000)
        self.assertEqual(res["tds"], 5178)
        self.assertEqual(res["pf"], 1800)
        self.assertEqual(res["pt"], 200)
        self.assertEqual(res["net_pay"], 87822)

    def test_epfo_pf_cap(self):
        # EPFO statutory ceiling is 1800/mo
        self.assertEqual(calculate_statutory_payroll(150000)["pf"], 1800)
        self.assertEqual(calculate_statutory_payroll(50000)["pf"], 1800)

if __name__ == "__main__":
    unittest.main()
