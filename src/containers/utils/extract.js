export const pluckFromObjectsArray = (args) => {
    for (let i = 0; i < args.array.length; i++) {
      if (args.array[i][args.property] === args.value) {
        return args.array[i];
      }
    }
}
