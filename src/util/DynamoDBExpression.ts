import {
    AndExpression,
    ComparisonOperand,
    ConditionExpression,
    ConditionExpressionPredicate,
} from "@aws/dynamodb-expressions";

type ExpressionPredicate = (...operands: ComparisonOperand[]) => ConditionExpressionPredicate;

export function and(...conditions: ConditionExpression[]): AndExpression {
    return {
        conditions,
        type: "And",
    };
}

export function condition(
    subject: string,
    fn: ExpressionPredicate,
    ...operands: ComparisonOperand[]
): ConditionExpression {
    return {
        subject,
        ...fn(...operands),
    };
}
