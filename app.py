from flask import Flask, render_template, request, jsonify
from pulp import LpProblem, LpMinimize, LpMaximize, LpVariable, lpSum, value

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/solve', methods=['POST'])
def solve():
    data = request.get_json()
    objective = data['objective']
    offers = data['offers']
    demands = data['demands']
    costs = data['costs']

    prob_type = LpMinimize if objective == 'min' else LpMaximize
    prob = LpProblem('TransportationProblem', prob_type)

    rows, cols = len(offers), len(demands)
    x = [[LpVariable(f'x_{i}_{j}', lowBound=0) for j in range(cols)] for i in range(rows)]

    # Objective function
    prob += lpSum(costs[i][j] * x[i][j] for i in range(rows) for j in range(cols))

    # Constraints
    for i in range(rows):
        prob += lpSum(x[i]) <= offers[i]
    for j in range(cols):
        prob += lpSum(x[i][j] for i in range(rows)) == demands[j]

    prob.solve()

    allocation = [[value(x[i][j]) for j in range(cols)] for i in range(rows)]
    total_cost = value(prob.objective)

    return jsonify({'totalCost': total_cost, 'allocation': allocation})

if __name__ == '__main__':
    app.run(debug=True)
