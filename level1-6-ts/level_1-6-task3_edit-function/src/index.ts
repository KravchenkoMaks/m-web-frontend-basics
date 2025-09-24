interface BigObject {
    [key: string]: Record<'value', number | string | BigObject | undefined> | undefined;
}

function summ(a: BigObject): number {
    const x = Object.keys(a).map(k => {
        const elem = a[k];
        if (elem === undefined) return 2021;
        if (typeof elem.value === 'string') {
            return isNaN(+elem.value) ? 2021 : (+elem.value);
        }
        if (typeof elem.value == 'object' && elem.value !==  undefined) {
            return summ(elem.value);
        }
        return elem.value ;
    });

    let sum = 0;
    for (let i = 0; i < x.length; i++) {
        sum +=  x[i] ?? 2021;
    }
    return sum;
}



