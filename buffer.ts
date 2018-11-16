import * as fs from 'buffer';
const _Size = [1,1,2,2,4,4,4,8,0];
export const enum Type { u8, s8, u16, s16, u32, s32, f32, f64, string }
export const enum Base { Start, Current, End }

export class Buffer {
	Size:number;
	Buffer:DataView;
	Position:number = 0;

	/**
	 * Takes an ArrayBuffer and creates a buffer from it
	 * @param data The data to load into the buffer
	 * @returns - The newly created buffer
	 */
	static Load(data:ArrayBuffer) {
		var _return:Buffer = new this(0);
		_return.Buffer = new DataView(data);
		_return.Size = _return.Buffer.byteLength;
		return 	_return;
	}

	/**
	 * Creates a new buffer instance
	 * @param size - The size to make the buffer
	 * @returns - The newly created buffer
	 */
	constructor(size:number) {
		this.Size = size;
		this.Position = 0;
		this.Buffer = new DataView(new ArrayBuffer(this.Size));
	}

	/**
	 * Moves the calling buffer's position
	 * @param offset - The position in which to seek to
	 * @param base - The base on which to read data on, defaults to the start
	 * @returns - The newly moved position
	 */
	Seek(offset:number, base:Base=Base.Start) {
		switch (base) {
			case Base.Start: {
				this.Position = offset % this.Size;
				return this.Position;
			}

			case Base.Current: {
				this.Position = (this.Position + offset) % this.Size;
				return this.Position;
			}

			case Base.End: {
                this.Position = (this.Size + offset) % this.Size;
				return this.Position;
			}
		}
		return this.Position;
	}

	/**
	 * Takes a type and offset then reads data from the buffer at that position
	 * @param type - The type of data to read from the buffer
	 * @param offset - The position at which to read the data from, defaults to the current position
	 * @returns - The data read from the buffer
	 */
	Peek(type:Type, offset:number = this.Position):any {
		switch (type) {
			case Type.u8: return this.Buffer.getUint8(offset);
			case Type.s8: return this.Buffer.getInt8(offset);
			case Type.u16: return this.Buffer.getUint16(offset, true);
			case Type.s16: return this.Buffer.getInt16(offset, true);
			case Type.u32: return this.Buffer.getUint32(offset, true);
			case Type.s32: return this.Buffer.getInt32(offset, true);
			case Type.f32: return this.Buffer.getFloat32(offset, true);
			case Type.f64: return this.Buffer.getFloat64(offset, true);
			case Type.string: {
				var _return = "";
				while (this.Buffer.getUint8(offset) != 0x00) {
					_return += String.fromCharCode(this.Buffer.getUint8(offset++));
				}
				return _return;
			}
		}
		return undefined;
	}

	/**
	 * Takes a type to read from the buffer to return and advances the current position
	 * @param type - The type of data to read from the buffer
	 * @returns - The data read from the buffer
	 */
	Read(type:Type):any {
		var _return = this.Peek(type);
		this.Position += _Size[type];
		return _return;
	}

	/**
	 * Takes a type, value, and position then writes it to the buffer at that position
	 * @param type - The type of data to write to the buffer
	 * @param value - The value to write to the buffer
	 * @param offset - The position at which to write the data, defaults to the current position
	 * @returns - The amount of bytes written to the buffer
	 */
	Poke(type:Type, value:any, offset:number = this.Position) {
		switch (type) {
			case Type.u8: this.Buffer.setUint8(offset, value as number); return _Size[type];
			case Type.s8: this.Buffer.setInt8(offset, value as number); return _Size[type];
			case Type.u16: this.Buffer.setUint16(offset, value, true); return _Size[type];
			case Type.s16: this.Buffer.setInt16(offset, value, true); return _Size[type];
			case Type.u32: this.Buffer.setUint32(offset, value, true); return _Size[type];
			case Type.s32: this.Buffer.setInt32(offset, value, true); return _Size[type];
			case Type.f32: this.Buffer.setFloat32(offset, value, true); return _Size[type];
			case Type.f64: this.Buffer.setFloat64(offset, value, true); return _Size[type];
			case Type.string: {
				for(var i = 0; i < (value as string).length; i++) {
					this.Buffer.setUint8(offset++, (value as string).charCodeAt(i));
				}
				this.Buffer.setUint8(offset++, 0x00);
				return offset;
			}
		}
		return offset;
	}

	/**
	 * Takes a type and value then writes it to the buffer and advances the current position
	 * @param type - The type of data to write to the buffer
	 * @param value - The value to write to the buffer
	 */
	Write(type:Type, value:any):any {
		this.Position += this.Poke(type, value);
		return true;
	}
}