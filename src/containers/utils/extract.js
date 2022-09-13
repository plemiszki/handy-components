export const parseUrl = () => {
  const pathDirectories = window.location.pathname.split('/');
  const id = pathDirectories[pathDirectories.length - 1];
  const directory = pathDirectories[pathDirectories.length - 2];
  return [id, directory];
}

export const pluckFromObjectsArray = (args) => {
    for (let i = 0; i < args.array.length; i++) {
      if (args.array[i][args.property] === args.value) {
        return args.array[i];
      }
    }
}
