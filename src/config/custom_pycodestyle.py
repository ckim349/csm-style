import pycodestyle
import sys
# import os


@pycodestyle.register_check
def check_two_blank_lines_before_top_level(logical_line, blank_lines, indent_level):
    """
    Check that top-level function and class definitions are preceded by two blank lines.
    """
    if indent_level == 0 and (logical_line.startswith('def ') or logical_line.startswith('class ')):
        if blank_lines < 2:
            yield (0, "CSM1 top-level function/class should be preceded by two blank lines")


@pycodestyle.register_check
def check_one_blank_line_before_inner_methods(logical_line, blank_lines, indent_level):
    """
    Check that method definitions inside a class are preceded by one blank line.
    """
    if indent_level > 0 and (logical_line.strip().startswith('def ')):
        if blank_lines < 1:
            yield (0, "CSM2 method definitions inside a class should be preceded by one blank line")


# Check just one file specified in the CLI
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python custom_pycodestyle_checks.py <filename.py>")
        sys.exit(1)
    filename = sys.argv[1]
    style_guide = pycodestyle.StyleGuide(select=["E125", "E126", "E127", "E128", "E101", "CSM1", "CSM2"])
    style_guide.input_file(filename)

# # Check all files in the current directory
# if __name__ == "__main__":
#     style_guide = pycodestyle.StyleGuide()
#     py_files = [f for f in os.listdir('.') if f.endswith('.py')]
#     for filename in py_files:
#         print(f"Checking {filename}")
#         style_guide.input_file(filename)
