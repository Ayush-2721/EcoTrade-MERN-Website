export function formatINR(value) {
    if (value === null || value === undefined || value === '') return ''
    const num = Number(value)
    if (Number.isNaN(num)) return ''
    return '₹' + num.toLocaleString('en-IN')
}

export default formatINR
