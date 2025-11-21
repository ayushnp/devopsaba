from flask import Flask, request, render_template_string, jsonify
import ast
import re

app = Flask(__name__)

# -------------------------
# ENHANCED COMPLEXITY DETECTION
# -------------------------

def detect_python_complexity(code):
    try:
        tree = ast.parse(code)
    except Exception as e:
        return {
            "time": "Invalid",
            "space": "Invalid",
            "reason": f"Syntax error: {str(e)}",
            "details": []
        }

    loop_depth = 0
    recursion_info = []
    space_structures = []
    details = []

    class ComplexityVisitor(ast.NodeVisitor):
        def __init__(self):
            self.depth = 0
            self.max_depth = 0
            self.loop_count = 0
            self.func_names = set()
            self.recursive_calls = set()

        def visit_FunctionDef(self, node):
            self.func_names.add(node.name)
            self.generic_visit(node)

        def visit_For(self, node):
            self.depth += 1
            self.loop_count += 1
            self.max_depth = max(self.max_depth, self.depth)
            details.append(f"For loop at depth {self.depth}")
            self.generic_visit(node)
            self.depth -= 1

        def visit_While(self, node):
            self.depth += 1
            self.loop_count += 1
            self.max_depth = max(self.max_depth, self.depth)
            details.append(f"While loop at depth {self.depth}")
            self.generic_visit(node)
            self.depth -= 1

        def visit_Call(self, node):
            if isinstance(node.func, ast.Name):
                if node.func.id in self.func_names:
                    self.recursive_calls.add(node.func.id)
                    recursion_info.append(f"Recursive call: {node.func.id}")
            self.generic_visit(node)

        def visit_List(self, node):
            space_structures.append("List")
            self.generic_visit(node)

        def visit_Dict(self, node):
            space_structures.append("Dictionary")
            self.generic_visit(node)

        def visit_Set(self, node):
            space_structures.append("Set")
            self.generic_visit(node)

    visitor = ComplexityVisitor()
    visitor.visit(tree)
    loop_depth = visitor.max_depth

    # Determine time complexity
    if visitor.recursive_calls:
        # Check for divide and conquer patterns
        if any(word in code.lower() for word in ["divide", "merge", "binary"]):
            time = "O(n log n)"
            reason = "Divide and conquer recursion (e.g., merge sort, binary search tree)"
        else:
            time = "O(2ⁿ)"
            reason = f"Exponential recursion detected in: {', '.join(visitor.recursive_calls)}"
    elif loop_depth == 0:
        time = "O(1)"
        reason = "Constant time - no loops or recursion"
    elif loop_depth == 1:
        # Check for binary search pattern
        if "while" in code and any(op in code for op in ["//", "//"]):
            time = "O(log n)"
            reason = "Logarithmic time - binary search pattern detected"
        else:
            time = "O(n)"
            reason = "Linear time - single loop iteration"
    elif loop_depth == 2:
        time = "O(n²)"
        reason = "Quadratic time - nested loops detected"
    elif loop_depth == 3:
        time = "O(n³)"
        reason = "Cubic time - triple nested loops"
    else:
        time = f"O(n^{loop_depth})"
        reason = f"Polynomial time - {loop_depth} nested loops"

    # Determine space complexity
    if visitor.recursive_calls:
        space = "O(n)"
        space_reason = "Recursion call stack"
    elif space_structures:
        space = "O(n)"
        space_reason = f"Data structures: {', '.join(set(space_structures))}"
    else:
        space = "O(1)"
        space_reason = "Constant space - only primitive variables"

    # Add details
    if visitor.loop_count > 0:
        details.append(f"Total loops: {visitor.loop_count}")
    if visitor.recursive_calls:
        details.extend(recursion_info)
    if space_structures:
        details.append(f"Space structures: {', '.join(set(space_structures))}")

    return {
        "time": time,
        "space": space,
        "reason": reason,
        "space_reason": space_reason,
        "details": details
    }


def detect_java_complexity(code):
    details = []
    
    # Count loops
    for_loops = len(re.findall(r'\bfor\s*\(', code))
    while_loops = len(re.findall(r'\bwhile\s*\(', code))
    total_loops = for_loops + while_loops
    
    # Detect recursion
    func_pattern = r'\b(\w+)\s*\([^)]*\)\s*\{'
    funcs = re.findall(func_pattern, code)
    recursive_funcs = []
    
    for func in funcs:
        # Check if function calls itself
        if len(re.findall(rf'\b{func}\s*\(', code)) > 1:
            recursive_funcs.append(func)
    
    # Detect space structures
    space_structures = []
    if 'new ArrayList' in code or 'new LinkedList' in code:
        space_structures.append('List')
    if 'new HashMap' in code or 'new HashSet' in code:
        space_structures.append('Map/Set')
    if 'new int[' in code or 'new String[' in code:
        space_structures.append('Array')
    
    # Determine time complexity
    if recursive_funcs:
        details.append(f"Recursive methods: {', '.join(recursive_funcs)}")
        time = "O(2ⁿ)"
        reason = "Exponential - recursive method detected"
    elif total_loops == 0:
        time = "O(1)"
        reason = "Constant time - no loops"
    elif total_loops == 1:
        time = "O(n)"
        reason = "Linear time - single loop"
    elif total_loops == 2:
        time = "O(n²)"
        reason = "Quadratic time - nested loops"
    elif total_loops >= 3:
        time = "O(n³)"
        reason = "Cubic time - triple nested loops"
    else:
        time = "O(n)"
        reason = "Linear estimation"
    
    # Determine space complexity
    if recursive_funcs:
        space = "O(n)"
        space_reason = "Recursion call stack"
    elif space_structures:
        space = "O(n)"
        space_reason = f"Data structures: {', '.join(space_structures)}"
        details.append(f"Space structures: {', '.join(space_structures)}")
    else:
        space = "O(1)"
        space_reason = "Constant space"
    
    if total_loops > 0:
        details.append(f"Total loops: {total_loops}")
    
    return {
        "time": time,
        "space": space,
        "reason": reason,
        "space_reason": space_reason,
        "details": details
    }


def analyze_code(code):
    # Detect language
    if any(keyword in code for keyword in ["class ", "public ", "static ", "void "]):
        return detect_java_complexity(code)
    return detect_python_complexity(code)


# -------------------------
# HTML TEMPLATE WITH POPUP
# -------------------------

TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>Code Complexity Analyzer</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @keyframes slideUp {
            from {
                transform: translateY(20px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        
        .modal-content {
            animation: slideUp 0.3s ease-out;
        }
        
        .complexity-badge {
            display: inline-block;
            padding: 0.5rem 1rem;
            border-radius: 9999px;
            font-weight: 600;
            font-size: 1.125rem;
        }
        
        .o1 { background: #10b981; color: white; }
        .ologn { background: #3b82f6; color: white; }
        .on { background: #f59e0b; color: white; }
        .onlogn { background: #f97316; color: white; }
        .on2 { background: #ef4444; color: white; }
        .on3 { background: #dc2626; color: white; }
        .exp { background: #7f1d1d; color: white; }
        
        .code-editor {
            font-family: 'Courier New', monospace;
            tab-size: 4;
        }
    </style>
</head>

<body class="bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen p-6">
    <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-8">
            <h1 class="text-5xl font-bold text-white mb-2">
                ⚡ Code Complexity Analyzer
            </h1>
            <p class="text-slate-300">Analyze time and space complexity like LeetCode</p>
        </div>

        <!-- Main Card -->
        <div class="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
            <form id="analyzeForm" class="space-y-4">
                <div>
                    <label class="block text-slate-300 mb-2 font-medium">
                        📝 Paste your code here (Python or Java)
                    </label>
                    <textarea 
                        id="codeInput" 
                        name="code" 
                        rows="18"
                        class="w-full p-4 rounded-xl bg-slate-900 text-slate-100 border border-slate-600 
                               focus:ring-2 focus:ring-purple-500 focus:border-transparent code-editor
                               placeholder-slate-500"
                        placeholder="def example(n):
    total = 0
    for i in range(n):
        for j in range(n):
            total += i * j
    return total"
                        required></textarea>
                </div>

                <button 
                    type="submit"
                    class="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 
                           text-white font-bold rounded-xl shadow-lg 
                           hover:from-purple-700 hover:to-pink-700 
                           transform hover:scale-105 transition-all duration-200">
                    🔍 Analyze Complexity
                </button>
            </form>
        </div>

        <!-- Footer -->
        <div class="text-center mt-8 text-slate-400 text-sm">
            <p>Supporting Python and Java • AST-based Analysis</p>
        </div>
    </div>

    <!-- Modal Popup -->
    <div id="resultModal" class="hidden fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
        <div class="modal-content bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full border-2 border-purple-500">
            <!-- Modal Header -->
            <div class="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-t-2xl">
                <div class="flex justify-between items-center">
                    <h2 class="text-2xl font-bold text-white">📊 Complexity Analysis</h2>
                    <button onclick="closeModal()" class="text-white hover:text-gray-200 text-3xl font-bold">
                        ×
                    </button>
                </div>
            </div>

            <!-- Modal Body -->
            <div class="p-8 space-y-6">
                <!-- Time Complexity -->
                <div class="bg-slate-900 rounded-xl p-6 border border-slate-700">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-slate-300">⏱️ Time Complexity</h3>
                        <span id="timeBadge" class="complexity-badge">O(n)</span>
                    </div>
                    <p id="timeReason" class="text-slate-400"></p>
                </div>

                <!-- Space Complexity -->
                <div class="bg-slate-900 rounded-xl p-6 border border-slate-700">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-slate-300">💾 Space Complexity</h3>
                        <span id="spaceBadge" class="complexity-badge">O(1)</span>
                    </div>
                    <p id="spaceReason" class="text-slate-400"></p>
                </div>

                <!-- Details -->
                <div id="detailsSection" class="bg-slate-900 rounded-xl p-6 border border-slate-700">
                    <h3 class="text-lg font-semibold text-slate-300 mb-3">🔍 Analysis Details</h3>
                    <ul id="detailsList" class="space-y-2 text-slate-400">
                    </ul>
                </div>
            </div>

            <!-- Modal Footer -->
            <div class="bg-slate-900 p-6 rounded-b-2xl border-t border-slate-700">
                <button 
                    onclick="closeModal()"
                    class="w-full px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl 
                           hover:bg-purple-700 transition-colors">
                    Got it!
                </button>
            </div>
        </div>
    </div>

    <script>
        const form = document.getElementById('analyzeForm');
        const modal = document.getElementById('resultModal');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const code = document.getElementById('codeInput').value;
            
            try {
                const response = await fetch('/analyze', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ code: code })
                });
                
                const result = await response.json();
                displayResults(result);
            } catch (error) {
                alert('Error analyzing code: ' + error.message);
            }
        });

        function displayResults(result) {
            // Set time complexity
            const timeBadge = document.getElementById('timeBadge');
            timeBadge.textContent = result.time;
            timeBadge.className = 'complexity-badge ' + getComplexityClass(result.time);
            document.getElementById('timeReason').textContent = result.reason;

            // Set space complexity
            const spaceBadge = document.getElementById('spaceBadge');
            spaceBadge.textContent = result.space;
            spaceBadge.className = 'complexity-badge ' + getComplexityClass(result.space);
            document.getElementById('spaceReason').textContent = result.space_reason;

            // Set details
            const detailsList = document.getElementById('detailsList');
            detailsList.innerHTML = '';
            
            if (result.details && result.details.length > 0) {
                result.details.forEach(detail => {
                    const li = document.createElement('li');
                    li.textContent = '• ' + detail;
                    detailsList.appendChild(li);
                });
            } else {
                detailsList.innerHTML = '<li>• No additional details</li>';
            }

            // Show modal
            modal.classList.remove('hidden');
        }

        function getComplexityClass(complexity) {
            const c = complexity.toLowerCase().replace(/\s/g, '');
            if (c.includes('o(1)')) return 'o1';
            if (c.includes('o(logn)')) return 'ologn';
            if (c.includes('o(nlogn)')) return 'onlogn';
            if (c.includes('o(n²)') || c.includes('o(n^2)')) return 'on2';
            if (c.includes('o(n³)') || c.includes('o(n^3)')) return 'on3';
            if (c.includes('o(2') || c.includes('exp')) return 'exp';
            if (c.includes('o(n)')) return 'on';
            return 'on';
        }

        function closeModal() {
            modal.classList.add('hidden');
        }

        // Close modal on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        });
    </script>
</body>
</html>
"""

# -------------------------
# ROUTES
# -------------------------

@app.route("/")
def home():
    return render_template_string(TEMPLATE)


@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json()
    code = data.get("code", "")
    
    if not code:
        return jsonify({"error": "No code provided"}), 400
    
    result = analyze_code(code)
    return jsonify(result)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
