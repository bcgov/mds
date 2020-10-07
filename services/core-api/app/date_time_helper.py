from dateutil.relativedelta import relativedelta


def get_duration_text(start_date, end_date):
    def get_duration_text_or_default(duration, unit):
        if duration <= 0:
            return ''

        unit = unit if duration == 1 else unit + "s"
        return f'{duration} {unit} '

    duration = relativedelta(end_date, start_date)
    if duration.microseconds < 0:
        return "Invalid - End Date precedes Start Date"

    yearsText = get_duration_text_or_default(duration.years, "Year")
    monthsText = get_duration_text_or_default(duration.months, "Month")
    weeksText = get_duration_text_or_default(duration.weeks, "Week")
    daysText = get_duration_text_or_default(duration.days - duration.weeks * 7, "Day")
    return f'{yearsText}{monthsText}{weeksText}{daysText}'
