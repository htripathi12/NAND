// @ts-ignore
@inline
export function NAND(a: boolean, b: boolean): boolean {
	// NOTE: && is somehow faster then & even though && produces one more wasm instruction
	// this may be because of some optimization with select
	return !(a && b);
}

let clock = true;

// @ts-ignore
@inline
export function tick(): void {
    clock = true;
}

// @ts-ignore
@inline
export function tock(): void {
    clock = false;
}

// @ts-ignore
@inline
export function nBit16(n: u16, i: u8): boolean {
	// TODO: this and placebit when used together can be further optimized
	// @ts-ignore
	return <boolean>((n >> i) & 1);
}

// @ts-ignore
@inline
export function nBit16_0(n: u16): boolean {
	// @ts-ignore
	return <boolean>(n & 1);
}

// @ts-ignore
@inline
function placeBit16(b: boolean, i: u8): u16 {
	// @ts-ignore
	return <u16>b << i;
}

// @ts-ignore
@inline
function placeBit16_0(b: boolean): u16 {
	// @ts-ignore
	return b;
}

/*
// @ts-ignore
@inline
export function word8_4(a: boolean, b: boolean, c: boolean, d: boolean): u8 {
	return <u8>(
		placeBit16_0(a) |
		placeBit16(b, 1) |
		placeBit16(c, 2) |
		placeBit16(d, 3)
	);
}

// @ts-ignore
@inline
export function word8_8(a: boolean, b: boolean, c: boolean, d: boolean, e: boolean, f: boolean, g: boolean, h: boolean): u8 {
	return <u8>(
		placeBit16_0(a) |
		placeBit16(b, 1) |
		placeBit16(c, 2) |
		placeBit16(d, 3) |
		placeBit16(e, 4) |
		placeBit16(f, 5) |
		placeBit16(g, 6) |
		placeBit16(h, 7)
	);
}
*/

// @ts-ignore
@inline
export function word16_16(a: boolean, b: boolean, c: boolean, d: boolean, e: boolean, f: boolean, g: boolean, h: boolean, 
						i: boolean, j: boolean, k: boolean, l: boolean, m: boolean, n: boolean, o: boolean, p: boolean): u16 {
	return placeBit16_0(a) |
			placeBit16(b, 1) |
			placeBit16(c, 2) |
			placeBit16(d, 3) |
			placeBit16(e, 4) |
			placeBit16(f, 5) |
			placeBit16(g, 6) |
			placeBit16(h, 7) |
			placeBit16(i, 8) |
			placeBit16(j, 9) |
			placeBit16(k, 10) |
			placeBit16(l, 11) |
			placeBit16(m, 12) |
			placeBit16(n, 13) |
			placeBit16(o, 14) |
			placeBit16(p, 15);
}

/*
// @ts-ignore
@inline
export function slice8_0to2(n: u8): u8 {
	return n & 7;
}

// @ts-ignore
@inline
export function slice16_0to5(n: u16): u8 {
	return <u8>(n & 63);
}

// @ts-ignore
@inline
export function slice16_0to8(n: u16): u16 {
	return n & 511;
}

// @ts-ignore
@inline
export function slice16_0to11(n: u16): u16 {
	return n & 4095;
}
*/

// @ts-ignore
@inline
export function slice16_0to14(n: u16): u16 {
	return n & 32767;
}

/*
// @ts-ignore
@inline
export function slice8_3to5(n: u8): u8 {
	return n >> 3;
}

// @ts-ignore
@inline
export function slice16_6to8(n: u16): u8 {
	return <u8>(n >> 6);
}

// @ts-ignore
@inline
export function slice16_9to11(n: u16): u8 {
	return <u8>(n >> 9);
}

// @ts-ignore
@inline
export function slice16_12to13(n: u16): u8 {
	return <u8>(n >> 12);
}
*/

let PC_dffout: u16 = 0;
// @ts-ignore
@inline
export function PC_reg(in_: u16): u16 {
	const out = PC_dffout;
	// NOTE: load is always true
	if (clock) {
		PC_dffout = in_;
	}
	return out;
}

let DRegister_dffout: u16 = 0;
// @ts-ignore
@inline
export function DRegister(in_: u16, load: boolean): u16 {
	const out = DRegister_dffout;
	if (clock && load) {
		DRegister_dffout = in_;
	}
	return out;
}

let ARegister_dffout: u16 = 0;
// @ts-ignore
@inline
export function ARegister(in_: u16, load: boolean): u16 {
	const out = ARegister_dffout;
	if (clock && load) {
		ARegister_dffout = in_;
	}
	return out;
}

const RAM16K_memory = new StaticArray<u16>(16384);
export function RAM16K(in_: u16, load: boolean, address: u16): u16 {
    const out = RAM16K_memory[address];
    if (clock && load) {
        RAM16K_memory[address] = in_;
    }
    return out;
}

const ROM32K_memory = new StaticArray<u16>(32768);
export function loadROM(in_: StaticArray<u16>): void {
	let i = 0;
    while (i < in_.length) {
		ROM32K_memory[i] = in_[i];
		i++;
	}
	while (i < ROM32K_memory.length) {
		ROM32K_memory[i] = 0;
		i++;
	}
}

export function ROM32K(address: u16): u16 {
	if (address < 0 || address > <u16>ROM32K_memory.length)
		throw new Error(address.toString());
	return ROM32K_memory[address];
}