exports.create = async (req, res) => {
    const credentials = auth(req);

    if (!credentials || !await check(credentials.name, credentials.pass)) {
        res.statusCode = 401
        res.setHeader('WWW-Authenticate', 'Basic realm="example"')
        res.send({Error: "Access denied"})
    } else {

        const arraySchema = joi.array().items(
            joi.object({
                category: joi.string()
            })
        );
        const schema = joi.object().keys({
            question_text: joi.string().required(),
            categories: arraySchema
        });

        let validation = schema.validate(req.body);
        if(validation.error) return res.status(400).send({Error: validation.error.details[0].message});

        let user = await User.findOne({where: {email_address: credentials.name}});

        let question = {
            question_id: uuidv4(),
            question_text: req.body.question_text,
        }
        let questionCreated = await Question.create(question)
        if(!questionCreated) return res.status(500).send({Error: "Internal Error"});

        await user.addQuestion(questionCreated)

        if(req.body.categories){
            let i = 0
            for(;i<req.body.categories.length;i++){
                let questionCategory = req.body.categories[i]
                let [categoryToAdd, created] = await Category.findOrCreate({where: {category: questionCategory.category},
                    defaults: {
                        category_id: uuidv4()
                    }
                })

                await questionCreated.addCategory(categoryToAdd)
            }

        }

        const result = await Question.findByPk(questionCreated.question_id,{
            include: [
                {
                    model: Category,
                    through: { attributes: [] }
                },
                {
                    as: 'answers',
                    model: Answer
                }]
        })

        return res.status(201).send(result);
    }
}