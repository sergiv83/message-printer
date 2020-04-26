class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = "ValidationError";
        this.status = 400;
    }
}

module.exports = {
    ValidationError,
    unwrapTransactionResult(results) {
        // reason: https://github.com/luin/ioredis/blob/a345103410932ffe2130186b38157bc722a7fcb2/lib/utils/index.ts#L75
        const unwarpped = results
            .filter(item => item.length > 1)
            .flatMap(item => item[1]);
        unwarpped.pop();
        return unwarpped;
    }
};
