module.exports.disableAllMethods = function disableAllMethods(model, methodsToExpose)
{
    if(model && model.sharedClass)
    {
        methodsToExpose = methodsToExpose || [];

        var modelName = model.sharedClass.name;
        var methods = model.sharedClass.methods();
        var relationMethods = [];
        var hiddenMethods = [];
        methods.push({ name: 'prototype.patchAttributes', isStatic: false });
        try
        {
            Object.keys(model.definition.settings.relations).forEach(function(relation)
            {
                relationMethods.push({ name: 'prototype.__findById__' + relation, isStatic: false });
                relationMethods.push({ name: 'prototype.__destroyById__' + relation, isStatic: false });
                relationMethods.push({ name: 'prototype.__updateById__' + relation, isStatic: false });
                relationMethods.push({ name: 'prototype.__exists__' + relation, isStatic: false });
                relationMethods.push({ name: 'prototype.__link__' + relation, isStatic: false });
                // relationMethods.push({ name: 'prototype.__get__' + relation, isStatic: false });
                relationMethods.push({ name: 'prototype.__create__' + relation, isStatic: false });
                relationMethods.push({ name: 'prototype.__update__' + relation, isStatic: false });
                relationMethods.push({ name: 'prototype.__destroy__' + relation, isStatic: false });
                relationMethods.push({ name: 'prototype.__unlink__' + relation, isStatic: false });
                // relationMethods.push({ name: 'prototype.__count__' + relation, isStatic: false });
                relationMethods.push({ name: 'prototype.__delete__' + relation, isStatic: false });
            });
        } catch(err) {}

        methods.concat(relationMethods).forEach(function(method)
        {
            var methodName = method.name;
            if(methodsToExpose.indexOf(methodName) < 0)
            {
                hiddenMethods.push(methodName);
                model.disableRemoteMethodByName(methodName, method.isStatic);
            }
        });

        if(hiddenMethods.length > 0)
        {
            // console.log('\nRemote mehtods hidden for', modelName, ':', hiddenMethods.join(', '), '\n');
        }
    }
};
