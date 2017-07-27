$(".pagination li:first").addClass("active");
var curpage = 1;
getDataByPage(curpage);
function getDataByPage(page){
    $.ajax({
        url:"/findByPage",
        data:{"page":page},
        success:function(data){
            console.log(data);

            $("#showWords").html("");
            (function iterator(i){
                console.log(data[i].name);
                //var username = ;
                if(i==data.length){
                    return;
                }
                $.ajax({
                    url:"/findByName",
                    cache:false,
                    data: {"name":data[i].name},
                    success:function(data2){
                        console.log(data2);
                        console.log(data2[0].avatar);
                        data[i].avatar = data2[0].avatar;
                        var comliled = _.template($("#moban").html());
                        var da = data[i];
                        var str = comliled({"name":da.name,"words":da.words,"time":da.time,"avatar":da.avatar,"_id":da._id});
                        $("#showWords").append(str);
                    }
                })
                iterator(i+1);
            })(0);
        }
    })
}
$(".pagination li").on("click",function(){
    //点击时获取当前页码，根据页码查询数据
    curpage = parseInt($(this).attr("data-page"));
    getDataByPage(curpage);
    $(this).addClass("active").siblings().removeClass("active");
})
