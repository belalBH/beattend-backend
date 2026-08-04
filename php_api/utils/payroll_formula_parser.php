<?php
/**
 * Safe Payroll Formula Parser & Expression Evaluator
 * AST Tokenizer & Recursive Descent Evaluator - No eval(), No Function(), Strict Safe Scope
 */

class PayrollFormulaParser {

    private static $allowedVariables = [
        'contract.base_salary',
        'contract.housing_allowance',
        'contract.transport_allowance',
        'contract.other_allowances',
        'attendance.absence_days',
        'attendance.lateness_hours',
        'attendance.overtime_hours',
        'inputs.manual_bonus',
        'inputs.manual_deduction',
        'totals.gross',
        'totals.gosi_taxable_base'
    ];

    private static $allowedFunctions = ['MIN', 'MAX', 'ROUND', 'SUM'];

    public static function evaluate($expression, $context = []) {
        $expression = trim($expression);
        if (empty($expression)) return '0.00';

        // 1. Tokenize
        $tokens = self::tokenize($expression);

        // 2. Validate Tokens against White-list
        self::validateTokens($tokens);

        // 3. Substitute Variables with Context Values
        $resolvedTokens = self::resolveVariables($tokens, $context);

        // 4. Evaluate Mathematical Expression
        $result = self::parseExpression($resolvedTokens);
        return number_format((float)$result, 4, '.', '');
    }

    private static function tokenize($expr) {
        $pattern = '/\s*([A-Za-z_][A-Za-z0-9_\.]*|\d+(?:\.\d+)?|[\+\-\*\/\(\),])\s*/';
        preg_match_all($pattern, $expr, $matches);
        return $matches[1] ?? [];
    }

    private static function validateTokens($tokens) {
        foreach ($tokens as $token) {
            if (is_numeric($token)) continue;
            if (in_array($token, ['+', '-', '*', '/', '(', ')', ','])) continue;
            if (in_array(strtoupper($token), self::$allowedFunctions)) continue;
            if (in_array(strtolower($token), self::$allowedVariables)) continue;

            throw new Exception("⚠️ Formula Parser Security Violation: Unrecognized or forbidden symbol '{$token}'");
        }
    }

    private static function resolveVariables($tokens, $context) {
        $resolved = [];
        foreach ($tokens as $t) {
            $lower = strtolower($t);
            if (in_array($lower, self::$allowedVariables)) {
                $val = 0.00;
                $parts = explode('.', $lower);
                if (count($parts) === 2 && isset($context[$parts[0]][$parts[1]])) {
                    $val = (float)$context[$parts[0]][$parts[1]];
                }
                $resolved[] = (string)$val;
            } else {
                $resolved[] = $t;
            }
        }
        return $resolved;
    }

    private static function parseExpression(&$tokens) {
        return self::parseAddition($tokens);
    }

    private static function parseAddition(&$tokens) {
        $left = self::parseMultiplication($tokens);
        while (!empty($tokens) && ($tokens[0] === '+' || $tokens[0] === '-')) {
            $op = array_shift($tokens);
            $right = self::parseMultiplication($tokens);
            if ($op === '+') {
                $left += $right;
            } else {
                $left -= $right;
            }
        }
        return $left;
    }

    private static function parseMultiplication(&$tokens) {
        $left = self::parsePrimary($tokens);
        while (!empty($tokens) && ($tokens[0] === '*' || $tokens[0] === '/')) {
            $op = array_shift($tokens);
            $right = self::parsePrimary($tokens);
            if ($op === '*') {
                $left *= $right;
            } else {
                if ($right == 0) {
                    throw new Exception("⚠️ Formula Parser Error: Division by zero");
                }
                $left = $left / $right;
            }
        }
        return $left;
    }

    private static function parsePrimary(&$tokens) {
        if (empty($tokens)) return 0;
        $token = array_shift($tokens);

        if (is_numeric($token)) {
            return (float)$token;
        }

        if ($token === '(') {
            $result = self::parseAddition($tokens);
            if (!empty($tokens) && $tokens[0] === ')') {
                array_shift($tokens); // consume ')'
            }
            return $result;
        }

        // Functions like MIN, MAX, ROUND
        $funcName = strtoupper($token);
        if (in_array($funcName, self::$allowedFunctions)) {
            if (!empty($tokens) && $tokens[0] === '(') {
                array_shift($tokens); // consume '('
            }
            $args = [];
            while (!empty($tokens) && $tokens[0] !== ')') {
                $args[] = self::parseAddition($tokens);
                if (!empty($tokens) && $tokens[0] === ',') {
                    array_shift($tokens);
                }
            }
            if (!empty($tokens) && $tokens[0] === ')') {
                array_shift($tokens); // consume ')'
            }

            if ($funcName === 'MIN') return !empty($args) ? min($args) : 0;
            if ($funcName === 'MAX') return !empty($args) ? max($args) : 0;
            if ($funcName === 'ROUND') return !empty($args) ? round($args[0], (int)($args[1] ?? 2)) : 0;
            if ($funcName === 'SUM') return !empty($args) ? array_sum($args) : 0;
        }

        return 0;
    }
}
