export class Console {
    static WriteLine(...args: any[]) {
        var _ = args[0];
        for(var i = 1; i < args.length; i++) {
            _ = (_ as string).replace("{" + (i - 1).toString() + "}", args[i]);
        }
        console.log(_);
    }
}