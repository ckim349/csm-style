import pycodestyle
import sys
import re
import ast
import traceback
from typing import List

@pycodestyle.register_check
def check_two_blank_lines_before_top_level(logical_line, blank_lines, indent_level):
    """
    Check that top-level function and class definitions are preceded by two blank lines.
    """
    if indent_level == 0 and (logical_line.startswith('def ') or logical_line.startswith('class ')):
        if blank_lines < 2:
            yield (0, "CSM1 top-level function/class should be preceded by two blank lines")


@pycodestyle.register_check
def check_one_blank_line_before_inner_methods(logical_line, blank_lines, indent_level, lines, line_number):
    """
    Check that method definitions inside a class are preceded by one blank line.
    """
    if indent_level > 0 and (logical_line.strip().startswith('def ')):
        if blank_lines < 1:
            if lines[line_number - 2].strip().startswith('class '): 
                yield (0, "CSM2 method definitions inside a class should be preceded by one blank line")


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
        yield (0, "CSM3 dunders should appear after module docstring and before imports")


@pycodestyle.register_check
def check_consistent_returns(logical_line, lines, line_number):
    """
    Check that return statements within a function are consistent.
    All return statements should either all return expressions or none should.
    If any return has a value, ensure explicit return None is used and a return exists at function end.
    """
    if not logical_line.strip().startswith('def '):
        return

    def get_function_body(lines: List[str], start_line: int) -> List[str]:
        """Extract function body."""
        body = []
        current_line = start_line
        
        # Skip empty lines at start
        while current_line < len(lines) and not lines[current_line].strip():
            current_line += 1
            
        if current_line >= len(lines):
            return body
            
        # Get base indentation from first non-empty line
        base_indent = len(lines[current_line]) - len(lines[current_line].lstrip())
        body.append(lines[current_line])
        current_line += 1
        
        # Collect function body
        while current_line < len(lines):
            line = lines[current_line]
            if not line.strip():
                body.append(line)
                current_line += 1
                continue
                
            current_indent = len(line) - len(line.lstrip())
            if current_indent <= base_indent:
                break
                
            body.append(line)
            current_line += 1
            
        return body

    try:
        # Get the function body
        body = get_function_body(lines, line_number - 1)
        if not body:
            return
            
        function_text = '\n'.join(body)
        
        # Parse the function
        tree = ast.parse(function_text)
        
        returns_with_value = []
        returns_without_value = []
        
        # Find all return statements
        for node in ast.walk(tree):
            if isinstance(node, ast.Return):
                if node.value is not None:
                    returns_with_value.append(node)
                else:
                    returns_without_value.append(node)
        
        # Check consistency
        if returns_with_value and returns_without_value:
            yield (0, "CSM4 inconsistent return statements - if any return has a value, all returns should have explicit values (including None)")
        
        # Check for missing return at end if there are returns with values
        if returns_with_value:
            last_line = body[-1].strip()
            if not (last_line.startswith('return') or 
                   any(last_line.startswith(x) for x in ['raise ', 'if ', 'while ', 'for '])):
                yield (0, "CSM5 missing explicit return statement at the end of function")
                
    except Exception as e:
        print(f"Error processing function at line {line_number}: {str(e)}")
        traceback.print_exc()

# Check just one file specified in the CLI
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python custom_pycodestyle_checks.py <filename.py>")
        sys.exit(1)
    filename = sys.argv[1]
    style_guide = pycodestyle.StyleGuide(select=["E125", "E126", "E127", "E128", "W504", "E101", "CSM1", "CSM2", "CSM3", "CSM4", "CSM5"])
    style_guide.input_file(filename)