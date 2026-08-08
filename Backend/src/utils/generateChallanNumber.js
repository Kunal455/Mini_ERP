const generateChallanNumber = () => {
    const dateStr = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `CH-${dateStr}-${randomNum}`;
};

module.exports = {
    generateChallanNumber
};
