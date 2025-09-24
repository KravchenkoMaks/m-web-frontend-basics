interface BigObject {
    [key: string]: Record<'value', number | string | BigObject | undefined>;
}

function summ(a: BigObject): number {
    const x: number[] = Object.keys(a).map(k => {
        const elem: Record<'value', number | string | BigObject | undefined> = a[k];
        if (elem.value == undefined) {
            return elem.value === undefined ? 2021 : 0;
        }
        if (typeof elem.value === 'string') {
            return isNaN(+elem.value) ? 2021 : +elem.value;
        }
        if (typeof elem.value === 'object') {
            return summ(elem.value);
        }
        return elem.value;
    });

    let sum = 0;
    for (let i = 0; i < x.length; i++) {
        sum += x[i];
    }
    return sum;
}



