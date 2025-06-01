import pycodestyle
import sys
import re

@pycodestyle.register_check
def check_two_blank_lines_before_top_level(logical_line, blank_lines, indent_level):
    """
    Check that top-level function and class definitions are preceded by two blank lines.
    """
    if indent_level == 0 and (logical_line.startswith('def ') or logical_line.startswith('class ')):
        if blank_lines < 2:
            yield (0, "CSM1 top-level function/class should be preceded by two blank lines")


@pycodestyle.register_check
def check_two_blank_lines_after_top_level(logical_line, lines, line_number):
    """
    Check that top-level function and class definitions at the end of a file are followed by two blank lines.
    """
    if line_number != len(lines):
        return
    if (lines[-1].strip() != '' or lines[-2].strip() != ''):
        for line in reversed(lines):
            # Finds first line with no indentation and is class or function
            if not line.startswith('  '):
                if line.startswith('def ') or line.startswith('class '):
                    yield (0, "CSM2 top-level function and class definitions at the end of a file should be followed by two blank lines.")
                return


@pycodestyle.register_check
def check_one_blank_line_before_inner_methods(logical_line, blank_lines, indent_level, lines, line_number):
    """
    Check that method definitions inside a class are preceded by one blank line.
    """
    if indent_level > 0 and (logical_line.strip().startswith('def ')):
        if blank_lines < 1:
            if lines[line_number - 2].strip().startswith('class '): 
                yield (0, "CSM3 method definitions inside a class should be preceded by one blank line")


@pycodestyle.register_check
def check_dunder_placement(logical_line, lines, line_number):
    """
    Check if module-level dunder assignments appear after docstring and before
    import statements.
    """
    if not logical_line.strip().startswith('__'):
        return  # only run once at start
    dunder_regex = re.compile(r'^__\w+__\s*=')

    found_docstring = False
    first_import_line = None
    first_dunder_line = None

    for i, line in enumerate(lines):
        stripped = line.strip()

        if not found_docstring and (stripped.startswith('"""')):
            found_docstring = True
            continue

        if stripped.startswith('import ') or stripped.startswith('from '):
            first_import_line = i + 1
            break

        if dunder_regex.match(stripped):
            first_dunder_line = i + 1
            break

    if (first_import_line and not first_dunder_line) or (first_import_line and not first_dunder_line):
        yield (0, "CSM4 dunders should appear after module docstring and before imports")


# Check just one file specified in the CLI
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python custom_pycodestyle_checks.py <filename.py>")
        sys.exit(1)
    filename = sys.argv[1]
    style_guide = pycodestyle.StyleGuide(select=["E125", "E126", "E127", "E128", "W504", "E101", "CSM1", "CSM2", "CSM3", "CSM4"])
    style_guide.input_file(filename)