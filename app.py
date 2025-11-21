from flask import Flask, request, render_template_string
import ast
import re

app = Flask(__name__)

# -------------------------
# COMPLEXITY DETECTION LOGIC
# -------------------------

def detect_python_complexity(code):
    try:
        tree = ast.parse(code)
    except:
        return "O(1)", "O(1)", "Invalid Python code"

    loop_depth = 0
    recursion = False
    space = "O(1)"

    # Count identifiers
    identifiers = re.findall(r"[A-Za-z_][A-Za-z0-9_]*", code)
    ident_freq = {i: identifiers.count(i) for i in set(identifiers)}

    class LoopDepthVisitor(ast.NodeVisitor):
        def __init__(self):
            self.depth = 0
            self.max_depth = 0

        def generic_visit(self, node):
            if isinstance(node, (ast.For, ast.While)):
                self.depth += 1
                self.max_depth = max(self.max_depth, self.depth)
                super().generic_visit(node)
                self.depth -= 1
            else:
                super().generic_visit(node)

    visitor = LoopDepthVisitor()
    visitor.visit(tree)
    loop_depth = visitor.max_depth

    # Detect recursion
    func_names = [node.name for node in ast.walk(tree) if isinstance(node, ast.FunctionDef)]
    for node in ast.walk(tree):
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name):
            if node.func.id in func_names:
                recursion = True

    # Detect space usage
    lists = re.findall(r"\[.*?\]", code)
    dicts = re.findall(r"\{.*?\}", code)
    if lists or dicts:
        space = "O(n)"

    # Time Complexity
    if recursion:
        return "O(2ⁿ)", space, "Recursion detected → exponential pattern"

    if loop_depth == 0:
        return "O(1)", space, "No loops detected → constant time"

    if loop_depth == 1:
        return "O(n)", space, "Single loop detected"

    if loop_depth == 2:
        return "O(n²)", space, "Nested loops detected → quadratic"

    if loop_depth == 3:
        return "O(n³)", space, "Triple nested loops → cubic"

    return "O(nⁿ)", space, "High nesting depth"


def detect_java_complexity(code):
    # Very basic Java heuristics
    loops = len(re.findall(r"for\s*\(|while\s*\(", code))
    recursion = False
    funcs = re.findall(r"\b([A-Za-z0-9_]+)\s*\(", code)

    for f in funcs:
        if re.findall(rf"{f}\s*\(", code):
            recursion = True

    space = "O(1)"
    if "new ArrayList" in code or "new int" in code:
        space = "O(n)"

    if recursion:
        return "O(2ⁿ)", space, "Recursive method detected"

    if loops == 0:
        return "O(1)", space, "No loops detected"

    if loops == 1:
        return "O(n)", space, "Single loop detected"

    if loops == 2:
        return "O(n²)", space, "Nested loops detected"

    if loops == 3:
        return "O(n³)", space, "Triple nested loops detected"

    return "O(nⁿ)", space, "Multiple loops"


def analyze_code(code):
    if "class" in code or "public" in code or "static" in code:
        return detect_java_complexity(code)
    return detect_python_complexity(code)


# -------------------------
# TAILWIND UI TEMPLATE
# -------------------------

TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>Code Complexity Analyzer</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>

<body class="bg-gray-100 min-h-screen p-6">
    <div class="max-w-4xl mx-auto">
        <h1 class="text-4xl font-bold text-center text-purple-600 mb-8">
            Code Complexity Analyzer
        </h1>

        <form method="POST" class="mb-8">
            <textarea name="code" rows="12"
                class="w-full p-4 rounded-xl border shadow focus:ring-2 focus:ring-purple-400"
                placeholder="Paste your Python or Java code here..." required>{{ code }}</textarea>

            <button class="mt-4 px-6 py-3 bg-purple-600 text-white rounded-xl shadow hover:bg-purple-700">
                Analyze Complexity
            </button>
        </form>

        {% if tc %}
        <div class="relative bg-white shadow rounded-2xl p-8 overflow-hidden">

            <!-- Background graph lines -->
            <svg class="absolute top-0 left-0 w-full h-full opacity-10">
                <!-- O(1) flat line -->
                <polyline points="0,180 300,180 600,180" stroke="gray" stroke-width="2" fill="none"/>

                <!-- O(log n) -->
                <polyline points="0,200 150,160 300,140 450,130 600,120" stroke="gray" stroke-width="2" fill="none"/>

                <!-- O(n) -->
                <polyline points="0,200 600,50" stroke="gray" stroke-width="2" fill="none"/>

                <!-- O(n log n) -->
                <polyline points="0,200 150,150 300,100 450,70 600,40" stroke="gray" stroke-width="2" fill="none"/>

                <!-- O(n^2) -->
                <polyline points="0,200 150,180 300,140 450,80 600,0" stroke="gray" stroke-width="2" fill="none"/>

                <!-- Highlighted curve -->
                {% if tc == "O(1)" %}
                    <polyline points="0,180 300,180 600,180" 
                              stroke="#7e22ce" stroke-width="4" fill="none"/>
                {% elif tc == "O(log n)" %}
                    <polyline points="0,200 150,160 300,140 450,130 600,120" 
                              stroke="#7e22ce" stroke-width="4" fill="none"/>
                {% elif tc == "O(n)" %}
                    <polyline points="0,200 600,50" 
                              stroke="#7e22ce" stroke-width="4" fill="none"/>
                {% elif tc == "O(n log n)" %}
                    <polyline points="0,200 150,150 300,100 450,70 600,40" 
                              stroke="#7e22ce" stroke-width="4" fill="none"/>
                {% elif tc == "O(n²)" or tc == "O(n^2)" %}
                    <polyline points="0,200 150,180 300,140 450,80 600,0" 
                              stroke="#7e22ce" stroke-width="4" fill="none"/>
                {% else %}
                    <polyline points="0,200 300,100 600,0" 
                              stroke="#7e22ce" stroke-width="4" fill="none"/>
                {% endif %}
            </svg>

            <!-- Foreground text -->
            <div class="relative">
                <h2 class="text-2xl font-bold text-purple-700">Time Complexity: {{ tc }}</h2>
                <h2 class="text-xl text-gray-700 mt-2">Space Complexity: {{ sc }}</h2>
                <p class="text-gray-600 mt-4">{{ reason }}</p>
            </div>
        </div>
        {% endif %}
    </div>
</body>
</html>
"""

# -------------------------
# ROUTES
# -------------------------

@app.route("/", methods=["GET", "POST"])
def home():
    code = ""
    tc = sc = reason = None

    if request.method == "POST":
        code = request.form["code"]
        tc, sc, reason = analyze_code(code)

    return render_template_string(TEMPLATE, code=code, tc=tc, sc=sc, reason=reason)


if __name__ == "__main__":
    app.run(debug=True)
