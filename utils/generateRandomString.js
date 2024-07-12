const generateRandomString = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomString = '';
    for (let i = 0; i < 10; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        randomString += chars[randomIndex];
    }
    return randomString;
}
module.exports = generateRandomString