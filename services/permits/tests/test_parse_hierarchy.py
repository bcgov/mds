import pytest
from app.permit_conditions.validator.parse_hierarchy import parse_hierarchy


def test_parse_hierarchy_subconditions():
    paragraphs = [
        {'text': 'B. Geotechnical', 'bounding_box': {'left': 1.2416}},
        {'text': '3. Subaqueous Waste Rock and Tailings Storage Facility (WRTSF)', 'bounding_box': {'left': 1.232}},
        {'text': '(a) Operations', 'bounding_box': {'left': 1.6236}},
        {'text': '(i) The Permittee must implement the Subaqueous Waste Rock and Tailings Storage Facility Operation, Maintenance, and Surveillance Manual (OMS Manual; Document 6.5). The Permittee must ensure the OMS manual is reviewed annually and updated, as needed, to reflect changes in status as the facility develops.', 'bounding_box': {'left': 2.0333}},
        {'text': '(ii) The Permittee must ensure all employees and contractors involved in the operation of the WRTSF are trained in the implementation of the OMS Manual and that records of the training be maintained on site.', 'bounding_box': {'left': 2.0293}},
        {'text': '(iii) The Permittee must ensure that all subaqueous placement of tailings is to be performed under the guidance of a Professional Engineer.', 'bounding_box': {'left': 2.0295}},
        {'text': '(iv) The Permittee must assign a qualified person to monitor dumping and to provide a daily work schedule that shows the locations and quantities of waste rock to dump. No dumping of material must occur unless approved by the qualified person.', 'bounding_box': {'left': 2.0295}},
        {'text': '(v) The Permittee must ensure that no weak, cohesive materials or snow be dumped within the ultimate design limits of the subaqueous waste rock dump area, with the exception that high fines (cohesive) materials may be placed under the direction of the qualified person in areas approved by the Engineer of Record. The Permittee must ensure the locations, total volume and percentage (with respect to total placed) material of the high fines content is documented and included in the semi-annual and annual reports.', 'bounding_box': {'left': 2.0235}},
        {'text': '(vi) The Permittee must ensure any weak, cohesive materials or snow that is dumped outside the ultimate design limits of the WRTSF, be documented (locations and quantities) and included in the applicable semi-annual and annual reports.', 'bounding_box': {'left': 2.0247}},
        {'text': '(vii) The Permittee may, following standard operating procedures set in the OMS manual, and as outlined in Document 7.2, use a conveyor, excavator, or remotely operated vehicle to place waste rock into the ponded portion of the WRTSF.', 'bounding_box': {'left': 2.0247}},
        {'text': '(viii) The Permittee must develop an operational setback and delineation of high-risk zone, including the following:', 'bounding_box': {'left': 2.0199}},
        {'text': '(a) The operational setback distance at the crest is defined with a Factor of Safety FoS > 1.1 for short term analysis of deep-seated failures and areas with less than a FoS of 1.1 are identifiable as a high-risk zone;', 'bounding_box': {'left': 2.4115}},
        {'text': '(b) The zone must be clearly marked at all times;', 'bounding_box': {'left': 2.4211}},
        {'text': '(c) No personnel must work alone within this zone at any time;', 'bounding_box': {'left': 2.4256}},
        {'text': '(d) A clear, unobstructed escape route for equipment working within this zone must be maintained;', 'bounding_box': {'left': 2.4258}},
    ]

    expected_results = [
        {'text': 'Geotechnical', 'numbering': 'B', 'section': 'B', 'paragraph': None, 'subparagraph': None, 'clause': None, 'subclause': None, 'subsubclause': None, 'bounding_box': {'left': 1.2416}},
        {'text': 'Subaqueous Waste Rock and Tailings Storage Facility (WRTSF)', 'numbering': '3', 'section': 'B', 'paragraph': '3', 'subparagraph': None, 'clause': None, 'subclause': None, 'subsubclause': None, 'bounding_box': {'left': 1.232}},
        {'text': 'Operations', 'numbering': 'a', 'section': 'B', 'paragraph': '3', 'subparagraph': 'a', 'clause': None, 'subclause': None, 'subsubclause': None, 'bounding_box': {'left': 1.6236}},
        {'text': 'The Permittee must implement the Subaqueous Waste Rock and Tailings Storage Facility Operation, Maintenance, and Surveillance Manual (OMS Manual; Document 6.5). The Permittee must ensure the OMS manual is reviewed annually and updated, as needed, to reflect changes in status as the facility develops.', 'numbering': 'i', 'section': 'B', 'paragraph': '3', 'subparagraph': 'a', 'clause': 'i', 'subclause': None, 'subsubclause': None, 'bounding_box': {'left': 2.0333}},
        {'text': 'The Permittee must ensure all employees and contractors involved in the operation of the WRTSF are trained in the implementation of the OMS Manual and that records of the training be maintained on site.', 'numbering': 'ii', 'section': 'B', 'paragraph': '3', 'subparagraph': 'a', 'clause': 'ii', 'subclause': None, 'subsubclause': None, 'bounding_box': {'left': 2.0293}},
        {'text': 'The Permittee must ensure that all subaqueous placement of tailings is to be performed under the guidance of a Professional Engineer.', 'numbering': 'iii', 'section': 'B', 'paragraph': '3', 'subparagraph': 'a', 'clause': 'iii', 'subclause': None, 'subsubclause': None, 'bounding_box': {'left': 2.0295}},
        {'text': 'The Permittee must assign a qualified person to monitor dumping and to provide a daily work schedule that shows the locations and quantities of waste rock to dump. No dumping of material must occur unless approved by the qualified person.', 'numbering': 'iv', 'section': 'B', 'paragraph': '3', 'subparagraph': 'a', 'clause': 'iv', 'subclause': None, 'subsubclause': None, 'bounding_box': {'left': 2.0295}},
        {'text': 'The Permittee must ensure that no weak, cohesive materials or snow be dumped within the ultimate design limits of the subaqueous waste rock dump area, with the exception that high fines (cohesive) materials may be placed under the direction of the qualified person in areas approved by the Engineer of Record. The Permittee must ensure the locations, total volume and percentage (with respect to total placed) material of the high fines content is documented and included in the semi-annual and annual reports.', 'numbering': 'v', 'section': 'B', 'paragraph': '3', 'subparagraph': 'a', 'clause': 'v', 'subclause': None, 'subsubclause': None, 'bounding_box': {'left': 2.0235}},
        {'text': 'The Permittee must ensure any weak, cohesive materials or snow that is dumped outside the ultimate design limits of the WRTSF, be documented (locations and quantities) and included in the applicable semi-annual and annual reports.', 'numbering': 'vi', 'section': 'B', 'paragraph': '3', 'subparagraph': 'a', 'clause': 'vi', 'subclause': None, 'subsubclause': None, 'bounding_box': {'left': 2.0247}},
        {'text': 'The Permittee may, following standard operating procedures set in the OMS manual, and as outlined in Document 7.2, use a conveyor, excavator, or remotely operated vehicle to place waste rock into the ponded portion of the WRTSF.', 'numbering': 'vii', 'section': 'B', 'paragraph': '3', 'subparagraph': 'a', 'clause': 'vii', 'subclause': None, 'subsubclause': None, 'bounding_box': {'left': 2.0247}},
        {'text': 'The Permittee must develop an operational setback and delineation of high-risk zone, including the following:', 'numbering': 'viii', 'section': 'B', 'paragraph': '3', 'subparagraph': 'a', 'clause': 'viii', 'subclause': None, 'subsubclause': None, 'bounding_box': {'left': 2.0199}},
        {'text': 'The operational setback distance at the crest is defined with a Factor of Safety FoS > 1.1 for short term analysis of deep-seated failures and areas with less than a FoS of 1.1 are identifiable as a high-risk zone;', 'numbering': 'a', 'section': 'B', 'paragraph': '3', 'subparagraph': 'a', 'clause': 'viii', 'subclause': 'a', 'subsubclause': None, 'bounding_box': {'left': 2.4115}},
        {'text': 'The zone must be clearly marked at all times;', 'numbering': 'b', 'section': 'B', 'paragraph': '3', 'subparagraph': 'a', 'clause': 'viii', 'subclause': 'b', 'subsubclause': None, 'bounding_box': {'left': 2.4211}},
        {'text': 'No personnel must work alone within this zone at any time;', 'numbering': 'c', 'section': 'B', 'paragraph': '3', 'subparagraph': 'a', 'clause': 'viii', 'subclause': 'c', 'subsubclause': None, 'bounding_box': {'left': 2.4256}},
        {'text': 'A clear, unobstructed escape route for equipment working within this zone must be maintained;', 'numbering': 'd', 'section': 'B', 'paragraph': '3', 'subparagraph': 'a', 'clause': 'viii', 'subclause': 'd', 'subsubclause': None, 'bounding_box': {'left': 2.4258}},
    ]

    result = parse_hierarchy(paragraphs)
    for r in result:
        del r['regex']

    assert result == expected_results

    


def test_parse_hierarchy():
    paragraphs = [
        {'text': 'A. Section 1'},
        {'text': '1). Paragraph 1'},
        {'text': '2). Paragraph 2'},
        {'text': 'Paragraph 3'},
        {'text': 'a) Subparagraph acc', 'bounding_box': {'left': 1.6236}},
        {'text': 'subparagraph text', 'bounding_box': {'left': 1.6236}},
        {'text': 'i) Clause i', 'bounding_box': {'left': 2.0293}},
        {'text': '(ii) Clause ii', 'bounding_box': {'left': 2.0293}},
        {'text': 'a) Subclause a', 'bounding_box': {'left': 2.4115}},
        {'text': 'B. General'},
        {'text': '1 Another one'},
        {'text': '2. Water Management and Monitoring'},
        {'text': 'a) Water Management'},
        {'text': 'b) Water Management2'},
        {'text': 'g) Water Management3', 'bounding_box': {'left': 1.6236}},
        {'text': '(i) The permittee must abc; and', 'bounding_box': {'left': 2.0333}},
        {'text': '(ii) The permittee must abcdef; and', 'bounding_box': {'left': 2.0293}},
        {'text': '(a) This is a subsubclause', 'bounding_box': {'left': 2.4115}},
        {'text': '(b) This is another subsubclause', 'bounding_box': {'left': 2.4211}},
        {'text': 'h) silly subparagraph','bounding_box': {'left': 1.6284}},
        {'text': '(i) a silly clause', 'bounding_box': {'left': 2.0199}},
        {'text': '(ii) another silly clause', 'bounding_box': {'left': 2.0199}},
        {'text': 'i) next silly subparagraph', 'bounding_box': {'left': 1.6236}}
    ]

    expected_result = [
        {'text': 'Section 1', 'section': 'A', 'paragraph': None, 'subparagraph': None, 'clause': None, 'subclause': None, 'subsubclause': None, 'numbering': 'A', 'regex': 'uppercase_letter'},
        {'text': 'Paragraph 1', 'section': 'A', 'paragraph': '1', 'subparagraph': None, 'clause': None, 'subclause': None, 'subsubclause': None, 'numbering': '1', 'regex': 'number'},
        {'text': 'Paragraph 2', 'section': 'A', 'paragraph': '2', 'subparagraph': None, 'clause': None, 'subclause': None, 'subsubclause': None, 'numbering': '2', 'regex': 'number'},
        {'text': 'Paragraph 3', 'section': 'A', 'paragraph': '2', 'subparagraph': None, 'clause': None, 'subclause': None, 'subsubclause': None, 'numbering': None, 'regex': None},
        {'text': 'Subparagraph acc', 'section': 'A', 'paragraph': '2', 'subparagraph': 'a', 'clause': None, 'subclause': None, 'subsubclause': None, 'numbering': 'a', 'regex': 'lowercase_letter', 'bounding_box': {'left': 1.6236}},
        {'text': 'subparagraph text', 'section': 'A', 'paragraph': '2', 'subparagraph': 'a', 'clause': None, 'subclause': None, 'subsubclause': None, 'numbering': None, 'regex': None, 'bounding_box': {'left': 1.6236}},
        {'text': 'Clause i', 'section': 'A', 'paragraph': '2', 'subparagraph': 'a', 'clause': 'i', 'subclause': None, 'subsubclause': None, 'numbering': 'i', 'regex': 'roman_numeral', 'bounding_box': {'left': 2.0293}},
        {'text': 'Clause ii', 'section': 'A', 'paragraph': '2', 'subparagraph': 'a', 'clause': 'ii', 'subclause': None, 'subsubclause': None, 'numbering': 'ii', 'regex': 'roman_numeral', 'bounding_box': {'left': 2.0293}},
        {'text': 'Subclause a', 'section': 'A', 'paragraph': '2', 'subparagraph': 'a', 'clause': 'ii', 'subclause': 'a', 'subsubclause': None, 'numbering': 'a', 'regex': 'lowercase_letter', 'bounding_box': {'left': 2.4115}},
        {'text': 'General', 'section': 'B', 'paragraph': None, 'subparagraph': None, 'clause': None, 'subclause': None, 'subsubclause': None, 'numbering': 'B', 'regex': 'uppercase_letter'},
        {'text': 'Another one', 'section': 'B', 'paragraph': '1', 'subparagraph': None, 'clause': None, 'subclause': None, 'subsubclause': None, 'numbering': '1', 'regex': 'number'},
        {'text': 'Water Management and Monitoring', 'section': 'B', 'paragraph': '2', 'subparagraph': None, 'clause': None, 'subclause': None, 'subsubclause': None, 'numbering': '2', 'regex': 'number'},
        {'text': 'Water Management', 'section': 'B', 'paragraph': '2', 'subparagraph': 'a', 'clause': None, 'subclause': None, 'subsubclause': None, 'numbering': 'a', 'regex': 'lowercase_letter'},
        {'text': 'Water Management2', 'section': 'B', 'paragraph': '2', 'subparagraph': 'b', 'clause': None, 'subclause': None, 'subsubclause': None, 'numbering': 'b', 'regex': 'lowercase_letter'},
        {'text': 'Water Management3', 'section': 'B', 'paragraph': '2', 'subparagraph': 'g', 'clause': None, 'subclause': None, 'subsubclause': None, 'numbering': 'g', 'regex': 'lowercase_letter', 'bounding_box': {'left': 1.6236}},
        {'text': 'The permittee must abc; and', 'section': 'B', 'paragraph': '2', 'subparagraph': 'g', 'clause': 'i', 'subclause': None, 'subsubclause': None, 'numbering': 'i', 'regex': 'roman_numeral', 'bounding_box': {'left': 2.0333}},
        {'text': 'The permittee must abcdef; and', 'section': 'B', 'paragraph': '2', 'subparagraph': 'g', 'clause': 'ii', 'subclause': None, 'subsubclause': None, 'numbering': 'ii', 'regex': 'roman_numeral', 'bounding_box': {'left': 2.0293}},
        {'text': 'This is a subsubclause', 'section': 'B', 'paragraph': '2', 'subparagraph': 'g', 'clause': 'ii', 'subclause': 'a', 'subsubclause': None, 'numbering': 'a', 'regex': 'lowercase_letter', 'bounding_box': {'left': 2.4115}},
        {'text': 'This is another subsubclause', 'section': 'B', 'paragraph': '2', 'subparagraph': 'g', 'clause': 'ii', 'subclause': 'b', 'subsubclause': None, 'numbering': 'b', 'regex': 'lowercase_letter', 'bounding_box': {'left': 2.4211}},
        {'text': 'silly subparagraph', 'section': 'B', 'paragraph': '2', 'subparagraph': 'h', 'clause': None, 'subclause': None, 'subsubclause': None, 'numbering': 'h', 'regex': 'lowercase_letter', 'bounding_box': {'left': 1.6284}},
        {'text': 'a silly clause', 'section': 'B', 'paragraph': '2', 'subparagraph': 'h', 'clause': 'i', 'subclause': None, 'subsubclause': None, 'numbering': 'i', 'regex': 'roman_numeral', 'bounding_box': {'left': 2.0199}},
        {'text': 'another silly clause', 'section': 'B', 'paragraph': '2', 'subparagraph': 'h', 'clause': 'ii', 'subclause': None, 'subsubclause': None, 'numbering': 'ii', 'regex': 'roman_numeral', 'bounding_box': {'left': 2.0199}},
        {'text': 'next silly subparagraph', 'section': 'B', 'paragraph': '2', 'subparagraph': 'i', 'clause': None, 'subclause': None, 'subsubclause': None, 'numbering': 'i', 'regex': 'lowercase_letter', 'bounding_box': {'left': 1.6236}},
    ]


    result = parse_hierarchy(paragraphs)


    assert result == expected_result

# def test_parse_numbering():
#     paragraphs = [
#         {'text': 'A. Section 1'},
#         {'text': '1). Paragraph 1'},
#         {'text': 'a) Subparagraph a'},
#         {'text': '(b) Subparagraph b'},
#         {'text': 'Clause 1'},
#         {'text': 'i. Subclause i'},
#         {'text': 'ii. Subclause ii'},
#         {'text': 'a. Subsubclause ii'},
#         {'text': 'b. Subsubclause with nested iii) abc'},
#     ]

#     expected_result = [
#             'A',
#             '1',
#             'a',
#             'b',
#             None,
#             'i',
#             'ii',
#             'a',
#             'b',
#         ]
    

#     result = parse_hierarchy(paragraphs)

#     assert [x['numbering'] for x in result] == expected_result

# def test_parse_text():
#     paragraphs = [
#         {'text': 'A. Section 1'},
#         {'text': '1). Paragraph 1'},
#         {'text': 'a) Subparagraph a'},
#         {'text': '(b) Subparagraph b'},
#         {'text': 'Clause 1'},
#         {'text': 'i. Subclause i'},
#         {'text': 'ii. Subclause ii'},
#         {'text': 'a. Subsubclause ii'},
#         {'text': 'b. Subsubclause with nested iii) abc'},
#     ]

#     expected_result = [
#         'Section 1',
#         'Paragraph 1',
#         'Subparagraph a',
#         'Subparagraph b',
#         'Clause 1',
#         'Subclause i',
#         'Subclause ii',
#         'Subsubclause ii',
#         'Subsubclause with nested iii) abc'
#     ]
    

#     result = parse_hierarchy(paragraphs)

#     assert [x['text'] for x in result] == expected_result

# def test_parse_number_regex():
#     paragraphs = [
#         {'text': 'A. Section 1'},
#         {'text': '1). Paragraph 1'},
#         {'text': 'i). Paragraph 2'},
#         {'text': 'a) Subparagraph a'},
#         {'text': '(b) Subparagraph b'},
#         {'text': 'Clause 1'},
#         {'text': 'i. Subclause i'},
#         {'text': 'ii. Subclause ii'},
#         {'text': 'a. Subsubclause ii'},
#         {'text': 'h. Subsubclause with nested iii) abc'},
#         {'text': 'i. Another clause'},
#         {'text': 'ii. Another clause'},
#         {'text': 'i. Another paragraph'},
#     ]

#     expected_result = [
#         {'A': 'uppercase_letter'},
#         {'1': 'number'},
#         {'i': 'roman_numeral'},
#         {'a': 'lowercase_letter'},
#         {'b': 'lowercase_letter'},
#         {'Clause': None},
#         {'i': 'roman_numeral'},
#         {'ii': 'roman_numeral'},
#         {'a': 'lowercase_letter'},
#         {'h': 'lowercase_letter'},
#         {'i': 'roman_numeral'},
#         {'ii': 'roman_numeral'},
#         {'i': 'lowercase_letter'},
#     ]
    

#     result = parse_hierarchy(paragraphs)

#     assert [{x['numbering'] or 'Clause': x['regex']} for x in result] == expected_result