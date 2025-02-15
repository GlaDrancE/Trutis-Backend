export const calculatePoints = (amount: number, points: number) => {
    const calculatePoints = points + (amount * 0.1);
    return calculatePoints;
}




export const handleCouponValidation = (couponValidity: number | null) => {
    if (couponValidity && couponValidity > 0) {
        const date = new Date();
        return new Date(date.getTime() + couponValidity * 24 * 60 * 60 * 1000);
    }
    return new Date(new Date().setDate(new Date().getDate() + 30))
}