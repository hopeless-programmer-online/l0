export default abstract class Word {
    public abstract IsEqual(other : Word) : boolean;
    public abstract toString() : string;
}
