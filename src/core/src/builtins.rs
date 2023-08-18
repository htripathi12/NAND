mod arithmetic;
mod gates;
mod architecture;

use wasm_bindgen::prelude::*;

pub fn nand(a: bool, b: bool) -> bool {
    !(a && b)
}

static mut CLOCK: bool = false;

pub fn tick() {
    unsafe { CLOCK = true };
}

pub fn tock() {
    unsafe { CLOCK = false };
}

pub fn n_bit16(n: u16, i: u8) -> bool {
	// TODO: this and placebit when used together can be further optimized
	((n >> i) & 1) != 0
}

pub fn n_bit16_0(n: u16) -> bool {
	(n & 1) != 0
}


fn place_bit16(b: bool, i: u8) -> u16 {
	u16::from(b) << i
}


fn place_bit16_0(b: bool) -> u16 {
	u16::from(b)
}

pub fn word16_16(a: bool, b: bool, c: bool, d: bool, e: bool, f: bool, g: bool, h: bool, 
        i: bool, j: bool, k: bool, l: bool, m: bool, n: bool, o: bool, p: bool) -> u16 {
	place_bit16_0(a) |
    place_bit16(b, 1) |
    place_bit16(c, 2) |
    place_bit16(d, 3) |
    place_bit16(e, 4) |
    place_bit16(f, 5) |
    place_bit16(g, 6) |
    place_bit16(h, 7) |
    place_bit16(i, 8) |
    place_bit16(j, 9) |
    place_bit16(k, 10) |
    place_bit16(l, 11) |
    place_bit16(m, 12) |
    place_bit16(n, 13) |
    place_bit16(o, 14) |
    place_bit16(p, 15)
}


pub fn slice16_0to12(n: u16) -> u16 {
	n & 8191
}


pub fn slice16_0to14(n: u16) -> u16 {
	n & 32767
}


pub fn slice16_13to14(n: u16) -> u16 {
	n >> 13
}

static mut PC_DFFOUT: u16 = 0;

pub fn pc_reg(in_: u16) -> u16 {
	let out = unsafe { PC_DFFOUT };
	// NOTE: load is always true
	if unsafe { CLOCK } {
		unsafe { PC_DFFOUT = in_ };
	}
	out
}

static mut DREGISTER_DFFOUT: u16 = 0;

pub fn dregister(in_: u16, load: bool) -> u16 {
    let out = unsafe { DREGISTER_DFFOUT };
	if unsafe { CLOCK } && load {
		unsafe { DREGISTER_DFFOUT = in_ };
		return in_;
	}
	out
}

static mut AREGISTER_DFFOUT: u16 = 0;

pub fn aregister(in_: u16, load: bool) -> u16 {
	let out = unsafe { AREGISTER_DFFOUT };
	if unsafe { CLOCK } && load {
		unsafe { AREGISTER_DFFOUT = in_ };
		return in_;
	}
	out
}

static mut RAM16K_MEMORY: Vec<u16> = Vec::new();

pub fn ram16k(in_: u16, load: bool, address: u16) -> u16 {
	if address >= 16384 {
		return 0;
	}
    let out = unsafe { &RAM16K_MEMORY }[address as usize];
    if unsafe { CLOCK } && load {
        unsafe { RAM16K_MEMORY[address as usize] = in_ };
    }
    out
}

#[wasm_bindgen]
pub fn get_ram() -> Vec<u16> {
	unsafe { RAM16K_MEMORY.clone() }
}

static mut CURRENT_KEY: u16 = 0;
#[wasm_bindgen]
pub fn keyboard(load: bool, pressed: u16) -> u16 {
	if load {
		unsafe { CURRENT_KEY = pressed };
	}
	unsafe { CURRENT_KEY }
}

static mut ROM32K_MEMORY: Vec<u16> = Vec::new();

pub fn rom32k(address: u16) -> u16 {
	unsafe { ROM32K_MEMORY[address as usize] }
}

#[wasm_bindgen]
pub fn load_rom(in_: JsValue) {
	unsafe { ROM32K_MEMORY = Vec::new() };
	let arr: js_sys::Array = in_.into();
	for i in 0..arr.length() {
		let s = arr.get(i).as_string().unwrap();
		let n = u16::from_str_radix(&s, 2).unwrap();
		unsafe { ROM32K_MEMORY.push(n) };
	}
}

static mut SCREEN_MEMORY: Vec<u16> = Vec::new();

pub fn screen(in_: u16, load: bool, address: u16) -> u16 {
	let out = unsafe { &SCREEN_MEMORY }[address as usize];
    if unsafe { CLOCK } && load {
        unsafe { SCREEN_MEMORY[address as usize] = in_ };
    }
    out
}

#[wasm_bindgen]
pub fn get_screen() -> Vec<u16> {
	unsafe { SCREEN_MEMORY.clone() }
}

#[wasm_bindgen]
pub fn init() {
	unsafe { RAM16K_MEMORY = vec![0; 16384] };
	// unsafe { ROM32K_MEMORY = vec![0; 32768] };
	unsafe { SCREEN_MEMORY = vec![0; 8192] };
}