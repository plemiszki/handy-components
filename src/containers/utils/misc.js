export const todayDMY = () => {
    const date = new Date;
    const month = date.getMonth() + 1;
    const dayOfMonth = date.getDate();
    const year = date.getFullYear().toString().slice(-2);
    return `${month}/${dayOfMonth}/${year}`;
}
