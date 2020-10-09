import pytest, datetime

from app.date_time_helper import get_duration_text


def test_date_difference_month():
    start_date = datetime.date(2020, 1, 1)
    end_date = datetime.date(2020, 2, 1)
    actual = get_duration_text(start_date, end_date)

    assert "1 Month " == actual


def test_date_difference_day():
    start_date = datetime.date(2020, 1, 1)
    end_date = datetime.date(2020, 1, 2)
    actual = get_duration_text(start_date, end_date)

    assert "1 Day " == actual


def test_date_difference_year():
    start_date = datetime.date(2020, 1, 1)
    end_date = datetime.date(2021, 1, 1)
    actual = get_duration_text(start_date, end_date)

    assert "1 Year " == actual


def test_date_difference_months():
    start_date = datetime.date(2020, 1, 1)
    end_date = datetime.date(2020, 5, 1)
    actual = get_duration_text(start_date, end_date)

    assert "4 Months " == actual


def test_date_difference_days():
    start_date = datetime.date(2020, 1, 1)
    end_date = datetime.date(2020, 1, 7)
    actual = get_duration_text(start_date, end_date)

    assert "6 Days " == actual


def test_date_difference_years():
    start_date = datetime.date(2020, 1, 1)
    end_date = datetime.date(2024, 1, 1)
    actual = get_duration_text(start_date, end_date)

    assert "4 Years " == actual


def test_date_difference():
    start_date = datetime.date(2020, 1, 1)
    end_date = datetime.date(2021, 4, 17)
    actual = get_duration_text(start_date, end_date)

    assert "1 Year 3 Months 2 Weeks 2 Days " == actual


def test_date_empty():
    start_date = datetime.date(2021, 1, 1)
    end_date = datetime.date(2020, 4, 17)
    actual = get_duration_text(start_date, end_date)

    assert "" == actual