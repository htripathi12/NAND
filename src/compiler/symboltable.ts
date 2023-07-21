import { NANDException, SyntaxException } from "../core/exceptions";

type SymbolAttribute = {type: string, kind: string, index: number};
export default class SymbolTable {
    private classSymbolTable: { [name: string]: SymbolAttribute } = {};
    private subroutineSymbolTable: { [name: string]: SymbolAttribute } = {};
    private counts: { [name: string]: number } = {
        'static': 0,
        'this': 0,
        'argument': 0,
        'local': 0,
    };

    private getTable(kind: string) {
        switch (kind) {
            case 'static':
            case 'this':
                return this.classSymbolTable;
            case 'argument':
            case 'local':
                return this.subroutineSymbolTable;
            default:
                throw new NANDException("Invalid kind: "+ kind);
        }
    }

    public startSubroutine(subroutineType: string): void {
        this.subroutineSymbolTable = {};
        switch (subroutineType) {
            case 'constructor':
            case 'function':
                this.counts.argument = 0;
                break;
            case 'method':
                this.counts.argument = 1;
                break;
            default:
                throw new SyntaxException();
        }
        this.counts.local = 0;
    }

    public define(name: string, type: string, kind: string): void {
        this.getTable(kind)[name] = {type, kind, index: this.counts[kind]++};
    }

    public count(kind: string): number {
        return this.counts[kind];
    }

    private getSymbol(name: string): SymbolAttribute | null {
        if (name in this.subroutineSymbolTable) {
            return this.subroutineSymbolTable[name];
        }
        if (name in this.classSymbolTable) {
            return this.classSymbolTable[name];
        }
        return null;
    }

    public kindOf(name: string): string | null {
        const symbolAttribute: SymbolAttribute | null = this.getSymbol(name);
        if (symbolAttribute === null)
            return null;
        return symbolAttribute.kind;
    }

    public typeOf(name: string): string | null {
        const symbolAttribute: SymbolAttribute | null = this.getSymbol(name);
        if (symbolAttribute === null)
            return null;
        return symbolAttribute.type;
    }

    public indexOf(name: string): number | null {
        const symbolAttribute: SymbolAttribute | null = this.getSymbol(name);
        if (symbolAttribute === null)
            return null;
        return symbolAttribute.index;
    }
}