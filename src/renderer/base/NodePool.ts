export class NodePool<T> {
    private __usedNode: T[] = [];
    private __idleNode: T[] = [];
    constructor(initialLen: number, private instantiate: () => T) {
        if (initialLen > 0) {
            for (let i = 0; i < initialLen; i++) {
                const node = this.instantiate();
                this.__idleNode.push(node);
            }
        }
    }

    getNode(): T {
        let node: T;
        if (this.__idleNode.length) {
            node = this.__idleNode[this.__idleNode.length - 1];
        }
        node = this.instantiate();
        this.__usedNode.push(node);
        node = this.instantiate();
        return node;
    }

    recycleNode(node: T): boolean {
        const index = this.__usedNode.indexOf(node);
        if (index >= 0) {
            this.__usedNode.splice(index, 1);
            this.__idleNode.push(node);
            return true;
        }
        return false;
    }
}
