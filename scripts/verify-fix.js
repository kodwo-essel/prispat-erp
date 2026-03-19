
// Logic verification script

function testLogic(saleType) {
    const normalizedSaleType = (saleType || "Credit").toLowerCase();
    const isCreditSale = normalizedSaleType === "credit";
    console.log(`Input: ${saleType}, Normalized: ${normalizedSaleType}, IsCreditSale: ${isCreditSale}`);

    // The if condition in the API:
    if (!isCreditSale) {
        console.log("  -> WOULD create immediate payment (Cash behavior)");
    } else {
        console.log("  -> WOULD NOT create immediate payment (Credit behavior)");
    }
}

console.log("Testing various inputs for saleType:");
testLogic("Credit");
testLogic("credit");
testLogic(undefined);
testLogic(null);
testLogic("Cash");
testLogic("cash");
testLogic("something-else");
